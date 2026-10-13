import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  institutionId: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  courseCode: string;
  courseName: string;
  credits: number;
  courseType: 'core' | 'elective' | 'lab' | 'project';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    courseCode: { type: String, required: true, uppercase: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1, max: 20 },
    courseType: {
      type: String,
      enum: ['core', 'elective', 'lab', 'project'],
      default: 'core',
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CourseSchema.index({ institutionId: 1, courseCode: 1 }, { unique: true });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
