import mongoose, { Schema, Document } from 'mongoose';

export interface ISemester extends Document {
  institutionId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  semesterNumber: number; // 1 to 10
  semesterType: 'odd' | 'even' | 'summer';
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema = new Schema<ISemester>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    semesterNumber: { type: Number, required: true, min: 1, max: 10 },
    semesterType: { type: String, enum: ['odd', 'even', 'summer'], default: 'odd' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

SemesterSchema.index({ institutionId: 1, academicYearId: 1, semesterNumber: 1 }, { unique: true });

export const Semester = mongoose.model<ISemester>('Semester', SemesterSchema);
