import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  institutionId: mongoose.Types.ObjectId;
  studentNumber: string; // Roll number
  userId?: mongoose.Types.ObjectId;
  programmeId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  admissionAcademicYearId: mongoose.Types.ObjectId;
  currentSemesterId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: string;
  contact: {
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
    };
  };
  guardian?: {
    name?: string;
    relation?: string;
    phone?: string;
    email?: string;
  };
  admissionDate: Date;
  studentStatus: 'admitted' | 'active' | 'graduated' | 'suspended' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    studentNumber: { type: String, required: true, uppercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    programmeId: { type: Schema.Types.ObjectId, ref: 'Programme', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    admissionAcademicYearId: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true,
      index: true,
    },
    currentSemesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    contact: {
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
      },
    },
    guardian: {
      name: String,
      relation: String,
      phone: String,
      email: String,
    },
    admissionDate: { type: Date, default: Date.now },
    studentStatus: {
      type: String,
      enum: ['admitted', 'active', 'graduated', 'suspended', 'withdrawn'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

StudentSchema.index({ institutionId: 1, studentNumber: 1 }, { unique: true });

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
