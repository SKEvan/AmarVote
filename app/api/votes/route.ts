import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import PoliticalParty from '@/models/PoliticalParty';
import PollingCenter from '@/models/PollingCenter';
import { withAuth, withOfficerAuth } from '@/lib/authMiddleware';

// GET /api/votes - Get all votes or votes by filter
const getHandler = async (req: NextRequest) => {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const pollingCenterId = searchParams.get('pollingCenterId');
    const userId = searchParams.get('userId');

    let query: any = {};

    if (pollingCenterId) {
      query.pollingCenter = pollingCenterId;
    }

    if (userId) {
      query['submittedBy.userId'] = userId;
    }

    const votes = await Vote.find(query)
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      votes,
      count: votes.length,
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getHandler);

// POST /api/votes - Submit new vote
const postHandler = async (req: NextRequest) => {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      pollingCenter,
      pollingCenterName,
      location,
      totalVotes,
      totalVoters,
      submittedBy,
      partyVotes,
      isCorrection,
    } = body;

    // Validate required fields
    if (!pollingCenter || !pollingCenterName || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required polling center information' },
        { status: 400 }
      );
    }

    if (!submittedBy || !submittedBy.userId || !submittedBy.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required submitter information' },
        { status: 400 }
      );
    }

    if (totalVotes === undefined || totalVoters === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing vote count information' },
        { status: 400 }
      );
    }

    // Validate vote counts
    if (totalVotes < 0 || totalVoters < 0) {
      return NextResponse.json(
        { success: false, error: 'Vote counts cannot be negative' },
        { status: 400 }
      );
    }

    if (totalVotes > totalVoters) {
      return NextResponse.json(
        { success: false, error: 'Total votes cannot exceed total registered voters' },
        { status: 400 }
      );
    }

    // Verify polling center exists, create if it doesn't (for officers registered before this feature)
    let pollingCenterExists = await PollingCenter.findOne({ pollingCenterId: pollingCenter });
    if (!pollingCenterExists) {
      // Auto-create polling center for officers who registered before this feature was added
      try {
        pollingCenterExists = await PollingCenter.create({
          pollingCenterId: pollingCenter,
          name: pollingCenterName,
          address: location,
          district: 'Unknown',
          thana: 'Unknown',
          division: 'Unknown',
          totalRegisteredVoters: totalVoters,
          status: 'Active',
          facilities: [],
          accessibility: true,
        });
        console.log('Auto-created polling center:', pollingCenter);
      } catch (createError) {
        console.error('Error creating polling center:', createError);
        return NextResponse.json(
          { success: false, error: 'Invalid polling center ID. Polling center not found in system.' },
          { status: 404 }
        );
      }
    }

    // Verify submitter exists
    const User = (await import('@/models/User')).default;
    const submitter = await User.findById(submittedBy.userId);
    if (!submitter) {
      return NextResponse.json(
        { success: false, error: 'Invalid user. Submitter not found in system.' },
        { status: 404 }
      );
    }

    // Check if vote already submitted for this polling center
    const existingVote = await Vote.findOne({ pollingCenter });

    if (existingVote && !isCorrection) {
      return NextResponse.json(
        { success: false, error: 'Votes already submitted for this polling center' },
        { status: 409 }
      );
    }

    // Build partyVoteBreakdown from partyVotes
    let partyVoteBreakdown: Array<{ partyId: string; partyName: string; votes: number }> = [];

    if (partyVotes && typeof partyVotes === 'object') {
      // Fetch all political parties
      const parties = await PoliticalParty.find({ status: 'active' }).lean();
      const partyMap = new Map(parties.map(p => [p.partyId, p.name]));

      partyVoteBreakdown = Object.entries(partyVotes).map(([partyId, votes]) => ({
        partyId,
        partyName: partyMap.get(partyId) || partyId,
        votes: Number(votes) || 0,
      }));
    }

    // If correction approved, update existing vote
    if (existingVote && isCorrection) {
      existingVote.totalVotes = totalVotes;
      existingVote.totalVoters = totalVoters;
      existingVote.partyVotes = partyVotes;
      existingVote.partyVoteBreakdown = partyVoteBreakdown;
      existingVote.submittedAt = new Date();
      
      await existingVote.save();

      return NextResponse.json({
        success: true,
        message: 'Votes corrected successfully',
        vote: existingVote,
        isCorrected: true,
      });
    }

    // Create new vote
    const newVote = new Vote({
      pollingCenter,
      pollingCenterId: pollingCenter,
      pollingCenterName,
      location,
      totalVotes,
      totalVoters,
      submittedBy,
      partyVotes,
      partyVoteBreakdown,
      status: 'submitted',
      submittedAt: new Date(),
    });

    await newVote.save();

    return NextResponse.json({
      success: true,
      message: 'Votes submitted successfully',
      vote: newVote,
    });
  } catch (error: any) {
    console.error('Error submitting votes:', error);
    
    // Handle MongoDB duplicate key error (from compound unique index)
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Votes have already been submitted and verified for this polling center. Duplicate submissions are not allowed.' 
        },
        { status: 409 }
      );
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message).join(', ');
      return NextResponse.json(
        { success: false, error: messages },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to submit votes. Please try again.' },
      { status: 500 }
    );
  }
};

export const POST = withOfficerAuth(postHandler);


// PATCH /api/votes - Update vote status (verify/reject)
const patchHandler = async (req: NextRequest) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { voteId, status, verifiedBy } = body;

    if (!voteId) {
      return NextResponse.json(
        { success: false, error: 'Vote ID is required' },
        { status: 400 }
      );
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      verifiedAt: new Date(),
    };

    if (verifiedBy) {
      updateData.verifiedBy = verifiedBy;
    }

    const updatedVote = await Vote.findByIdAndUpdate(
      voteId,
      updateData,
      { new: true }
    );

    if (!updatedVote) {
      return NextResponse.json(
        { success: false, error: 'Vote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vote status updated successfully',
      vote: updatedVote,
    });
  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vote' },
      { status: 500 }
    );
  }
};

export const PATCH = withOfficerAuth(patchHandler);
