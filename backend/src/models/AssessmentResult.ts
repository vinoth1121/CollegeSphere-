import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessmentResult extends Document {
  institutionId: mongoose.Types.ObjectId;
  examinationId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  marksObtained: number;
  grade?: string;
  resultStatus: 'draft' | 'verified' | 'published';
  enteredBy: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentResultSchema = new Schema<IAssessmentResult>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    examinationId: { type: Schema.Types.ObjectId, ref: 'Examination', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    marksObtained: { type: Number, required: true, min: 0 },
    grade: { type: String, trim: true },
    resultStatus: {
      type: String,
      enum: ['draft', 'verified', 'published'],
      default: 'draft',
      index: true,
    },
    enteredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

AssessmentResultSchema.index(
  { institutionId: 1, examinationId: 1, studentId: 1 },
  { unique: true }
);

export const AssessmentResult = mongoose.model<IAssessmentResult>(
  'AssessmentResult',
  AssessmentResultSchema
);
