import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { ValidationUtils } from '@/lib/validation';

// POST /api/auth/register - Register new user (Officer or Police)
export async function POST(request: NextRequest) {
  try {
    // First try to connect to the database
    try {
      await dbConnect();
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError.message);
      return NextResponse.json(
        { 
          error: 'Database connection unavailable. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? `DB Error: ${dbError.message}` : undefined
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { username, password, email, role, phone, nid, name, ...otherFields } = body;

    if (!username || !password || !email || !role) {
      return NextResponse.json(
        { error: 'Username, password, email, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format comprehensively
    if (email) {
      const emailValidation = ValidationUtils.validateEmail(email);
      if (!emailValidation.isValid) {
        return NextResponse.json(
          { error: emailValidation.error },
          { status: 400 }
        );
      }
    }

    // Validate name format
    if (name) {
      const nameValidation = ValidationUtils.validateName(name, 3, 50);
      if (!nameValidation.isValid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 }
        );
      }
    }

    // Validate phone number if provided
    if (phone) {
      const phoneValidation = ValidationUtils.validatePhone(phone);
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          { error: phoneValidation.error },
          { status: 400 }
        );
      }
    }

    // Validate NID if provided
    if (nid) {
      const nidValidation = ValidationUtils.validateNID(nid);
      if (!nidValidation.isValid) {
        return NextResponse.json(
          { error: nidValidation.error },
          { status: 400 }
        );
      }
      
      // Check if NID already exists
      const existingNID = await User.findOne({ nid: nid });
      if (existingNID) {
        return NextResponse.json(
          { error: 'This NID is already registered. Each person can only register once.' },
          { status: 400 }
        );
      }
    }

    // Only allow Officer and Police registration through this endpoint
    if (role !== 'Officer' && role !== 'Police') {
      return NextResponse.json(
        { error: 'Invalid role. Only Officer and Police can register.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with Pending status
    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      email: email.toLowerCase(),
      name,
      role,
      status: 'Pending',
      joinedDate: new Date(),
      lastActive: 'Never',
      phone,
      nid,
      ...otherFields,
    });

    // Return user without password
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please wait for admin approval.',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during registration:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Handle database connection errors
    if (error.message?.includes('connect') || error.code === 'ECONNREFUSED') {
      return NextResponse.json({
        error: 'Database connection failed. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }
    
    // Handle network/timeout errors
    if (error.name === 'MongooseServerSelectionError' || error.message?.includes('timeout')) {
      return NextResponse.json({
        error: 'Database server is unavailable. Please try again in a few minutes.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, { status: 503 });
    }
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      
      // Provide specific message for NID
      if (field === 'nid') {
        return NextResponse.json(
          { error: 'This NID is already registered. Each person can only register once.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `This ${field} is already registered. Please choose a different ${field}.` },
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      console.error('Validation errors:', messages);
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
