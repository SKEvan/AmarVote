import mongoose, { Schema, Document, Model } from 'mongoose';

// Polling Center Interface (includes vote submission fields)
export interface IPollingCenter extends Document {
  pollingCenterId: string;
  name: string;
  address: string;
  district: string;
  thana?: string;
  division?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  totalRegisteredVoters: number;
  assignedOfficer?: {
    userId: string;
    name: string;
    serviceId: string;
  };
  status: 'Active' | 'Inactive' | 'Pending Setup';
  facilities: string[];
  accessibility: boolean;
  pollingStartTime?: Date;
  pollingEndTime?: Date;
  
  // Vote Submission fields
  voteSubmission?: {
    submittedBy: {
      userId: string;
      name: string;
      serviceId: string;
    };
    voteCounts: Array<{
      partyName: string;
      partySymbol: string;
      votes: number;
    }>;
    totalVotes: number;
    status: 'Submitted' | 'Verified' | 'Rejected' | 'Correction Requested';
    verifiedBy?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
    correctionNotes?: string;
    correctionRequestedAt?: Date;
    submittedAt: Date;
  };
  
  // Vote submission history for audit trail
  voteSubmissionHistory?: Array<{
    submittedBy: {
      userId: string;
      name: string;
      serviceId: string;
    };
    voteCounts: Array<{
      partyName: string;
      partySymbol: string;
      votes: number;
    }>;
    totalVotes: number;
    status: 'Submitted' | 'Verified' | 'Rejected' | 'Correction Requested';
    verifiedBy?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
    correctionNotes?: string;
    submittedAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

// Polling Center Schema
const PollingCenterSchema = new Schema<IPollingCenter>(
  {
    pollingCenterId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    thana: {
      type: String,
      trim: true,
    },
    division: {
      type: String,
      trim: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    totalRegisteredVoters: {
      type: Number,
      required: true,
      min: 0,
      max: 50000, // Reasonable maximum for a single polling center
      default: 0,
    },
    assignedOfficer: {
      userId: String,
      name: String,
      serviceId: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending Setup'],
      default: 'Pending Setup',
    },
    facilities: {
      type: [String],
      default: [],
    },
    accessibility: {
      type: Boolean,
      default: true,
    },
    pollingStartTime: Date,
    pollingEndTime: Date,
    
    // Vote Submission fields
    voteSubmission: {
      submittedBy: {
        userId: String,
        name: String,
        serviceId: String,
      },
      voteCounts: [{
        partyName: {
          type: String,
          required: true,
        },
        partySymbol: String,
        votes: {
          type: Number,
          required: true,
          min: 0,
        },
      }],
      totalVotes: {
        type: Number,
        min: 0,
      },
      status: {
        type: String,
        enum: ['Submitted', 'Verified', 'Rejected', 'Correction Requested'],
      },
      verifiedBy: String,
      verifiedAt: Date,
      rejectionReason: String,
      correctionNotes: String,
      correctionRequestedAt: Date,
      submittedAt: Date,
    },
    
    // Vote submission history for audit trail
    voteSubmissionHistory: [{
      submittedBy: {
        userId: String,
        name: String,
        serviceId: String,
      },
      voteCounts: [{
        partyName: {
          type: String,
          required: true,
        },
        partySymbol: String,
        votes: {
          type: Number,
          required: true,
          min: 0,
        },
      }],
      totalVotes: {
        type: Number,
        min: 0,
      },
      status: {
        type: String,
        enum: ['Submitted', 'Verified', 'Rejected', 'Correction Requested'],
      },
      verifiedBy: String,
      verifiedAt: Date,
      rejectionReason: String,
      correctionNotes: String,
      submittedAt: Date,
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes
PollingCenterSchema.index({ pollingCenterId: 1 });
PollingCenterSchema.index({ district: 1, thana: 1 });
PollingCenterSchema.index({ 'assignedOfficer.userId': 1 });
PollingCenterSchema.index({ status: 1 });

const PollingCenter: Model<IPollingCenter> =
  mongoose.models.PollingCenter ||
  mongoose.model<IPollingCenter>('PollingCenter', PollingCenterSchema);

export default PollingCenter;
