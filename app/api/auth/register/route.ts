import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// POST /api/auth/register - Register new user (Officer or Police)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, password, email, role, phone, nid, name, ...otherFields } = body;

    if (!username || !password || !email || !role) {
      return NextResponse.json(
        { error: 'Username, password, email, and role are required' },
        { status: 400 }
      );
    }

    // Validate name format
    if (name) {
      if (name.length < 3 || name.length > 50) {
        return NextResponse.json(
          { error: 'Name must be between 3 and 50 characters' },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z\s.]+$/.test(name)) {
        return NextResponse.json(
          { error: 'Name can only contain letters, spaces, and dots' },
          { status: 400 }
        );
      }
    }

    // Validate phone number if provided
    if (phone) {
      const cleanPhone = phone.replace(/\s/g, '');
      const isValid11Digit = /^01[3-9]\d{8}$/.test(cleanPhone) && cleanPhone.length === 11;
      const isValid14Char = /^\+8801[3-9]\d{8}$/.test(cleanPhone) && cleanPhone.length === 14;
      
      if (!isValid11Digit && !isValid14Char) {
        return NextResponse.json(
          { error: 'Phone number must be 11 digits starting with 01 (e.g., 01712345678) or 14 characters starting with +8801 (e.g., +8801712345678)' },
          { status: 400 }
        );
      }
    }

    // Validate NID if provided
    if (nid) {
      if (!/^\d{10}$/.test(nid)) {
        return NextResponse.json(
          { error: 'NID must be exactly 10 digits' },
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

    // If Officer role and has polling center info, create polling center
    if (role === 'Officer' && otherFields.pollingCenterId && otherFields.pollingCenterName) {
      const PollingCenter = (await import('@/models/PollingCenter')).default;
      
      // Check if polling center already exists
      const existingCenter = await PollingCenter.findOne({ 
        pollingCenterId: otherFields.pollingCenterId 
      });
      
      if (!existingCenter) {
        // Create new polling center
        await PollingCenter.create({
          pollingCenterId: otherFields.pollingCenterId,
          name: otherFields.pollingCenterName,
          address: otherFields.pollingCenterName,
          division: otherFields.division || 'Unknown',
          district: otherFields.district || 'Unknown',
          thana: otherFields.thana || 'Unknown',
          totalRegisteredVoters: 0,
          status: 'Active',
          facilities: [],
          accessibility: false,
        });
      }
    }

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
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
