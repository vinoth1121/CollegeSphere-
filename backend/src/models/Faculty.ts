import mongoose, { Schema, Document } from 'mongoose';

export interface IFaculty extends Document {
  institutionId: mongoose.Types.ObjectId;
  employeeNumber: string;
  userId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  designation: string;
  qualification?: string;
  contact: {
    email: string;
    phone?: string;
  };
  assignedSubjects: mongoose.Types.ObjectId[];
  employmentStatus: 'active' | 'on_leave' | 'terminated' | 'resigned';
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    employeeNumber: { type: String, required: true, uppercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true },
    contact: {
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: String,
    },
    assignedSubjects: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    employmentStatus: {
      type: String,
      enum: ['active', 'on_leave', 'terminated', 'resigned'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

FacultySchema.index({ institutionId: 1, employeeNumber: 1 }, { unique: true });

export const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);
