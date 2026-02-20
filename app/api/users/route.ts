import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { withAdminAuth } from '@/lib/authMiddleware';

// GET /api/users - Get all users or filter by query
const getHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let query: any = {};

    if (userId) {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user }, { status: 200 });
    }

    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const GET = withAdminAuth(getHandler);

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

export const PATCH = withAdminAuth(patchHandler);

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
