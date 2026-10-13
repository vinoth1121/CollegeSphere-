import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  institutionId: mongoose.Types.ObjectId;
  programmeId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  className: string; // e.g. "CSE-3A"
  section: string; // "A"
  classAdvisorId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    programmeId: { type: Schema.Types.ObjectId, ref: 'Programme', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
    className: { type: String, required: true, trim: true },
    section: { type: String, required: true, uppercase: true, trim: true },
    classAdvisorId: { type: Schema.Types.ObjectId, ref: 'Faculty' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ClassSchema.index(
  { institutionId: 1, programmeId: 1, semesterId: 1, section: 1 },
  { unique: true }
);

export const Class = mongoose.model<IClass>('Class', ClassSchema);
