import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  institutionId: mongoose.Types.ObjectId;
  departmentCode: string;
  departmentName: string;
  hodUserId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    departmentCode: { type: String, required: true, uppercase: true, trim: true },
    departmentName: { type: String, required: true, trim: true },
    hodUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

DepartmentSchema.index({ institutionId: 1, departmentCode: 1 }, { unique: true });

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
