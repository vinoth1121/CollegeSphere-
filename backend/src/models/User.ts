import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'hod'
  | 'faculty'
  | 'student'
  | 'accounts'
  | 'exam_officer';

export interface IUser extends Document {
  institutionId: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  permissions: string[];
  accountStatus: 'active' | 'disabled' | 'pending_verification' | 'suspended';
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: {
      type: [String],
      enum: ['super_admin', 'admin', 'hod', 'faculty', 'student', 'accounts', 'exam_officer'],
      default: ['student'],
      index: true,
    },
    permissions: [{ type: String }],
    accountStatus: {
      type: String,
      enum: ['active', 'disabled', 'pending_verification', 'suspended'],
      default: 'active',
      index: true,
    },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as any).passwordHash;
        delete (ret as any).passwordResetToken;
        delete (ret as any).passwordResetExpires;
        return ret;
      },
    },
  }
);

UserSchema.index({ institutionId: 1, email: 1 }, { unique: true });

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
