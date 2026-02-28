import mongoose, { Schema, Document, Model } from 'mongoose';

// User Interface
export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  nid?: string;
  role: 'Admin' | 'Officer' | 'Police';
  status: 'Active' | 'Inactive' | 'Pending';
  location: string;
  joinedDate: Date;
  lastActive: string;
  serviceId?: string;
  rank?: string;
  avatar?: string;
  pollingCenterId?: string;
  pollingCenterName?: string;
  thana?: string;
  nidDocument?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
      validate: {
        validator: function(v: string) {
          // Only letters, spaces, and dots allowed
          return /^[a-zA-Z\s.]+$/.test(v);
        },
        message: 'Name can only contain letters, spaces, and dots'
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          // Must be exactly 11 digits starting with 01 OR exactly 14 characters starting with +8801
          const cleanPhone = v.replace(/\s/g, ''); // Remove spaces
          
          // Check for +8801 format (14 characters total)
          if (cleanPhone.startsWith('+8801')) {
            return cleanPhone.length === 14 && /^\+8801[3-9]\d{8}$/.test(cleanPhone);
          }
          
          // Check for 01 format (11 digits)
          if (cleanPhone.startsWith('01')) {
            return cleanPhone.length === 11 && /^01[3-9]\d{8}$/.test(cleanPhone);
          }
          
          return false;
        },
        message: 'Phone number must be 11 digits starting with 01 (e.g., 01712345678) or 14 characters starting with +8801 (e.g., +8801712345678)'
      }
    },
    nid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null values
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          // Must be exactly 10 digits
          return /^\d{10}$/.test(v);
        },
        message: 'NID must be exactly 10 digits'
      }
    },
    role: {
      type: String,
      enum: ['Admin', 'Officer', 'Police'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending'],
      default: 'Pending',
    },
    location: {
      type: String,
      required: true,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: String,
      default: 'Never',
    },
    serviceId: String,
    rank: String,
    avatar: String,
    pollingCenterId: String,
    pollingCenterName: String,
    thana: String,
    nidDocument: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries (email and username already indexed by unique constraint)
UserSchema.index({ role: 1, status: 1, createdAt: -1 }); // Compound index for filtering and sorting
UserSchema.index({ pollingCenterId: 1, status: 1 });
UserSchema.index({ deletedAt: 1 }); // For soft delete filtering
UserSchema.index({ nid: 1 }, { unique: true, sparse: true }); // NID uniqueness
UserSchema.index({ name: 1 }); // For name search
UserSchema.index({ createdAt: -1 }); // For sorting

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
