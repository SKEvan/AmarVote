import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PollingCenter from '@/models/PollingCenter';
import { withAuth, withAdminAuth } from '@/lib/authMiddleware';

// GET /api/polling-centers - Get all polling centers or filter by query
const getHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const thana = searchParams.get('thana');
    const status = searchParams.get('status');
    const centerId = searchParams.get('centerId');

    let query: any = {};

    if (centerId) {
      const center = await PollingCenter.findOne({ pollingCenterId: centerId });
      if (!center) {
        return NextResponse.json({ error: 'Polling center not found' }, { status: 404 });
      }
      return NextResponse.json({ center }, { status: 200 });
    }

    if (district) query.district = district;
    if (thana) query.thana = thana;
    if (status) query.status = status;

    const centers = await PollingCenter.find(query).sort({ district: 1, name: 1 });

    return NextResponse.json({ centers }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching polling centers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);

// POST /api/polling-centers - Create a new polling center
const postHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();

    // Check if polling center ID already exists
    const existing = await PollingCenter.findOne({ pollingCenterId: body.pollingCenterId });
    if (existing) {
      return NextResponse.json(
        { error: 'Polling center ID already exists' },
        { status: 400 }
      );
    }

    const center = await PollingCenter.create(body);

    return NextResponse.json({ center }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating polling center:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A polling center with this ID already exists. Please use a unique polling center ID.' },
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create polling center' }, { status: 500 });
  }
};

export const POST = withAdminAuth(postHandler);

// PATCH /api/polling-centers - Update polling center
const patchHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { centerId, ...updates } = body;

    if (!centerId) {
      return NextResponse.json({ error: 'Center ID is required' }, { status: 400 });
    }

    const center = await PollingCenter.findOneAndUpdate(
      { pollingCenterId: centerId },
      updates,
      { new: true, runValidators: true }
    );

    if (!center) {
      return NextResponse.json({ error: 'Polling center not found' }, { status: 404 });
    }

    return NextResponse.json({ center }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating polling center:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update polling center' }, { status: 500 });
  }
};

export const PATCH = withAdminAuth(patchHandler);

// DELETE /api/polling-centers - Delete polling center
const deleteHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');

    if (!centerId) {
      return NextResponse.json({ error: 'Center ID is required' }, { status: 400 });
    }

    const center = await PollingCenter.findOneAndDelete({ pollingCenterId: centerId });

    if (!center) {
      return NextResponse.json({ error: 'Polling center not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Polling center deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting polling center:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const DELETE = withAdminAuth(deleteHandler);
