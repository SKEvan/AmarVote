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
      validate: {
        validator: function(v: string) {
          if (!v) return false;
          
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(v)) return false;
          
          const emailParts = v.split('@');
          if (emailParts.length !== 2) return false;
          
          const [localPart, domainPart] = emailParts;
          
          // Local part validations
          if (localPart.length < 1 || localPart.length > 64) return false;
          if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) return false;
          
          // Domain part validations
          const domainParts = domainPart.split('.');
          if (domainParts.length < 2) return false;
          
          // Domain name must be at least 2 characters
          if (domainParts[0].length < 2) return false;
          
          // TLD must be at least 2 characters and only letters
          const tld = domainParts[domainParts.length - 1];
          if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;
          
          return true;
        },
        message: 'Please enter a valid email address'
      }
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
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ pollingCenterId: 1, status: 1 });
UserSchema.index({ deletedAt: 1 }); // For soft delete filtering
UserSchema.index({ nid: 1 }, { unique: true, sparse: true }); // NID uniqueness

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
