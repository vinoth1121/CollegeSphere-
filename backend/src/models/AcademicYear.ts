import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicYear extends Document {
  institutionId: mongoose.Types.ObjectId;
  label: string; // e.g. "2025-2026"
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const AcademicYearSchema = new Schema<IAcademicYear>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    label: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

AcademicYearSchema.index({ institutionId: 1, label: 1 }, { unique: true });

export const AcademicYear = mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema);
