import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { withAdminAuth } from '@/lib/authMiddleware';

// GET /api/audit-logs - Get all audit logs or filter by query
const getHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const action = searchParams.get('action');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page');

    let query: any = {};

    if (user) query.user = new RegExp(user, 'i');
    if (action) query.action = new RegExp(action, 'i');

    const pageNumber = parseInt(page || '1');
    const limitNumber = parseInt(limit || '100');
    const skip = (pageNumber - 1) * limitNumber;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await AuditLog.countDocuments(query);

    return NextResponse.json(
      {
        logs,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          pages: Math.ceil(total / limitNumber),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const GET = withAdminAuth(getHandler);

// POST /api/audit-logs - Create a new audit log
const postHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { user, action, details, ip } = body;

    if (!user || !action || !details || !ip) {
      return NextResponse.json(
        { error: 'User, action, details, and IP are required' },
        { status: 400 }
      );
    }

    const log = await AuditLog.create({
      user,
      action,
      details,
      ip,
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const POST = withAdminAuth(postHandler);
