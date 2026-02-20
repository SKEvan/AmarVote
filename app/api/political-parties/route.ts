import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PoliticalParty from '@/models/PoliticalParty';
import { withAuth, withAdminAuth } from '@/lib/authMiddleware';

// GET /api/political-parties - Get all political parties or filter by query
const getHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const partyId = searchParams.get('partyId');

    let query: any = {};

    if (partyId) {
      const party = await PoliticalParty.findOne({ partyId });
      if (!party) {
        return NextResponse.json({ error: 'Political party not found' }, { status: 404 });
      }
      return NextResponse.json({ party }, { status: 200 });
    }

    if (status) query.status = status;

    const parties = await PoliticalParty.find(query).sort({ name: 1 });

    return NextResponse.json({ parties }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching political parties:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);

// POST /api/political-parties - Create a new political party
const postHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();

    // Check if party ID already exists
    const existing = await PoliticalParty.findOne({ partyId: body.partyId });
    if (existing) {
      return NextResponse.json(
        { error: 'Party ID already exists' },
        { status: 400 }
      );
    }

    const party = await PoliticalParty.create(body);

    return NextResponse.json({ party }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating political party:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A political party with this ID already exists. Please use a unique party ID.' },
        { status: 400 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create political party' }, { status: 500 });
  }
};

export const POST = withAdminAuth(postHandler);

// PATCH /api/political-parties - Update political party
const patchHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { partyId, ...updates } = body;

    if (!partyId) {
      return NextResponse.json({ error: 'Party ID is required' }, { status: 400 });
    }

    const party = await PoliticalParty.findOneAndUpdate(
      { partyId },
      updates,
      { new: true, runValidators: true }
    );

    if (!party) {
      return NextResponse.json({ error: 'Political party not found' }, { status: 404 });
    }

    return NextResponse.json({ party }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating political party:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const PATCH = withAdminAuth(patchHandler);

// DELETE /api/political-parties - Delete political party
const deleteHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId');

    if (!partyId) {
      return NextResponse.json({ error: 'Party ID is required' }, { status: 400 });
    }

    const party = await PoliticalParty.findOneAndDelete({ partyId });

    if (!party) {
      return NextResponse.json({ error: 'Political party not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Political party deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting political party:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const DELETE = withAdminAuth(deleteHandler);
