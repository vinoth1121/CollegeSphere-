import mongoose, { Schema, Document } from 'mongoose';

export type ExamType = 'internal' | 'midterm' | 'final' | 'practical' | 'assignment';

export interface IExamination extends Document {
  institutionId: mongoose.Types.ObjectId;
  courseOfferingId: mongoose.Types.ObjectId;
  examinationName: string;
  examinationType: ExamType;
  examDate: Date;
  maximumMarks: number;
  passMarks: number;
  weightagePercentage?: number;
  status: 'scheduled' | 'draft_marks' | 'verified' | 'published' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ExaminationSchema = new Schema<IExamination>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    courseOfferingId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseOffering',
      required: true,
      index: true,
    },
    examinationName: { type: String, required: true, trim: true },
    examinationType: {
      type: String,
      enum: ['internal', 'midterm', 'final', 'practical', 'assignment'],
      default: 'internal',
    },
    examDate: { type: Date, required: true },
    maximumMarks: { type: Number, required: true, min: 1 },
    passMarks: { type: Number, required: true, min: 0 },
    weightagePercentage: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['scheduled', 'draft_marks', 'verified', 'published', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
  },
  { timestamps: true }
);

ExaminationSchema.index({ institutionId: 1, courseOfferingId: 1, examinationName: 1 });

export const Examination = mongoose.model<IExamination>('Examination', ExaminationSchema);
