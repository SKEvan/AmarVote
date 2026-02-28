import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { withAdminAuth, withAuth } from '@/lib/authMiddleware';

// GET /api/users - Get all users or filter by query with pagination
const getHandler = async (request: NextRequest) => {
  const startTime = Date.now();
  try {
    await dbConnect();
    console.log(`[Users API] DB connect took: ${Date.now() - startTime}ms`);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // If requesting single user by ID
    if (userId) {
      const user = await User.findById(userId).select('-password').lean();
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user }, { status: 200 });
    }

    let query: any = {};

    // Filter by role and status
    if (role && role !== 'All') query.role = role;
    if (status && status !== 'All') query.status = status;

    // Search by name, email, or username
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { username: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    const queryStart = Date.now();
    // Execute query with pagination using lean() for better performance
    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select('-password -nidDocument') // Exclude large fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(10000), // 10 second timeout
      User.countDocuments(query).maxTimeMS(5000)
    ]);
    
    console.log(`[Users API] Query took: ${Date.now() - queryStart}ms, Total time: ${Date.now() - startTime}ms, Found ${users.length} users`);

    return NextResponse.json({ 
      users, 
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('[Users API] Error:', error, `Time elapsed: ${Date.now() - startTime}ms`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

// Allow authenticated users to access their own profile, admins can access all
export const GET = withAuth(getHandler);

// POST /api/users - Create a new user
const postHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, password, email, ...otherFields } = body;

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

    // Create new user
    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      email: email.toLowerCase(),
      ...otherFields,
    });

    // Return user without password
    const userResponse: any = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return NextResponse.json(
        { error: `This ${field} is already registered. Please use a different ${field}.` },
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
};

export const POST = withAdminAuth(postHandler);

// PATCH /api/users - Update user
const patchHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return NextResponse.json(
        { error: `This ${field} is already registered. Please use a different ${field}.` },
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
};

export const PATCH = withAuth(patchHandler);

// DELETE /api/users - Delete user
const deleteHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const DELETE = withAdminAuth(deleteHandler);
