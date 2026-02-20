import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Incident from '@/models/Incident';
import { withAuth } from '@/lib/authMiddleware';

// GET /api/incidents - Get all incidents or filter by query
const getHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const userId = searchParams.get('userId');
    const incidentId = searchParams.get('incidentId');

    let query: any = {};

    if (incidentId) {
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      }
      return NextResponse.json({ incident }, { status: 200 });
    }

    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (userId) query['reportedBy.userId'] = userId;

    const incidents = await Incident.find(query).sort({ reportedAt: -1 });

    return NextResponse.json({ incidents }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const GET = withAuth(getHandler);

// POST /api/incidents - Create a new incident
const postHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();

    const incident = await Incident.create({
      ...body,
      reportedAt: new Date(),
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create incident' }, { status: 500 });
  }
};

export const POST = withAuth(postHandler);

// PATCH /api/incidents - Update incident
const patchHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const body = await request.json();
    const { incidentId, ...updates } = body;

    console.log('PATCH /api/incidents - Received:', { incidentId, updates });

    if (!incidentId) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    // If status is being changed to Resolved, set resolvedAt
    if (updates.status === 'Resolved') {
      updates.resolvedAt = new Date();
    }

    const incident = await Incident.findByIdAndUpdate(incidentId, updates, {
      new: true,
      runValidators: true,
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    console.log('PATCH /api/incidents - Updated incident:', {
      id: incident._id,
      status: incident.status,
      acknowledgedBy: incident.acknowledgedBy,
      acknowledgedAt: incident.acknowledgedAt,
      acknowledgementNotes: incident.acknowledgementNotes
    });

    return NextResponse.json({ incident }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating incident:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
};

export const PATCH = withAuth(patchHandler);

// DELETE /api/incidents - Delete incident
const deleteHandler = async (request: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const incidentId = searchParams.get('incidentId');

    if (!incidentId) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    const incident = await Incident.findByIdAndDelete(incidentId);

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Incident deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting incident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const DELETE = withAuth(deleteHandler);
