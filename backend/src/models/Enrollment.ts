import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  institutionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseOfferingId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  status: 'enrolled' | 'dropped' | 'completed';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    courseOfferingId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseOffering',
      required: true,
      index: true,
    },
    enrolledAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['enrolled', 'dropped', 'completed'],
      default: 'enrolled',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

EnrollmentSchema.index(
  { institutionId: 1, studentId: 1, courseOfferingId: 1 },
  { unique: true }
);

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
