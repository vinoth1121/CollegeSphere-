import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseOffering extends Document {
  institutionId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  classId?: mongoose.Types.ObjectId;
  facultyIds: mongoose.Types.ObjectId[];
  capacity: number;
  enrolledCount: number;
  registrationStart?: Date;
  registrationEnd?: Date;
  status: 'scheduled' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const CourseOfferingSchema = new Schema<ICourseOffering>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    facultyIds: [{ type: Schema.Types.ObjectId, ref: 'Faculty' }],
    capacity: { type: Number, default: 60 },
    enrolledCount: { type: Number, default: 0 },
    registrationStart: { type: Date },
    registrationEnd: { type: Date },
    status: {
      type: String,
      enum: ['scheduled', 'open', 'in_progress', 'completed', 'cancelled'],
      default: 'open',
      index: true,
    },
  },
  { timestamps: true }
);

CourseOfferingSchema.index(
  { institutionId: 1, courseId: 1, academicYearId: 1, semesterId: 1, classId: 1 },
  { unique: true }
);

export const CourseOffering = mongoose.model<ICourseOffering>(
  'CourseOffering',
  CourseOfferingSchema
);
