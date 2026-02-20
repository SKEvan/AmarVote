import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';
import {
  isRateLimited,
  recordFailedAttempt,
  clearFailedAttempts,
  getBlockedTimeRemaining,
} from '@/lib/rateLimit';

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      );
    }

    // Create identifier for rate limiting (username + role)
    const rateLimitId = `${username.toLowerCase()}_${role.toLowerCase()}`;

    // Check rate limiting
    if (isRateLimited(rateLimitId)) {
      const remainingMs = getBlockedTimeRemaining(rateLimitId);
      const remainingMinutes = Math.ceil(remainingMs / 60000);
      
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
          blockedFor: remainingMinutes,
        },
        { status: 429 }
      );
    }

    // Map role to database role format
    const roleMap: { [key: string]: string } = {
      admin: 'Admin',
      officer: 'Officer',
      police: 'Police',
    };

    const dbRole = roleMap[role.toLowerCase()];

    if (!dbRole) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({
      username: username.toLowerCase(),
      role: dbRole,
    });

    if (!user) {
      // Record failed attempt
      const attemptInfo = recordFailedAttempt(rateLimitId);
      
      return NextResponse.json(
        {
          error: 'Invalid credentials. Please check your username, password, and selected role.',
          attemptsLeft: attemptInfo.blocked ? 0 : attemptInfo.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failed attempt
      const attemptInfo = recordFailedAttempt(rateLimitId);
      
      if (attemptInfo.blocked) {
        return NextResponse.json(
          {
            error: 'Too many failed login attempts. Your account has been temporarily blocked for 15 minutes.',
            blockedUntil: attemptInfo.blockedUntil,
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Invalid credentials. Please check your username, password, and selected role.',
          attemptsLeft: attemptInfo.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // Check status
    if (user.status === 'Pending') {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please wait for admin verification.' },
        { status: 403 }
      );
    }

    if (user.status === 'Inactive') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(rateLimitId);

    // Update last active
    user.lastActive = new Date().toLocaleString();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
    });

    // Return user info with token
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      location: user.location,
      pollingCenterId: user.pollingCenterId,
      pollingCenterName: user.pollingCenterName,
      serviceId: user.serviceId,
      rank: user.rank,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: userResponse,
        token, // JWT token for authentication
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
