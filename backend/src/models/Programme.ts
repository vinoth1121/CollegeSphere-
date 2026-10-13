import mongoose, { Schema, Document } from 'mongoose';

export interface IProgramme extends Document {
  institutionId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  programmeCode: string;
  programmeName: string;
  degreeType: 'UG' | 'PG' | 'DIPLOMA' | 'PHD';
  durationSemesters: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgrammeSchema = new Schema<IProgramme>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    programmeCode: { type: String, required: true, uppercase: true, trim: true },
    programmeName: { type: String, required: true, trim: true },
    degreeType: {
      type: String,
      enum: ['UG', 'PG', 'DIPLOMA', 'PHD'],
      default: 'UG',
    },
    durationSemesters: { type: Number, required: true, default: 8 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ProgrammeSchema.index({ institutionId: 1, programmeCode: 1 }, { unique: true });

export const Programme = mongoose.model<IProgramme>('Programme', ProgrammeSchema);
