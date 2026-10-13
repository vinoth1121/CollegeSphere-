import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceSession extends Document {
  institutionId: mongoose.Types.ObjectId;
  courseOfferingId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  sessionDate: Date; // normalized to YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  topic?: string;
  sessionStatus: 'conducted' | 'cancelled' | 'finalized';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    courseOfferingId: {
      type: Schema.Types.ObjectId,
      ref: 'CourseOffering',
      required: true,
      index: true,
    },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true, index: true },
    sessionDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    topic: { type: String, trim: true },
    sessionStatus: {
      type: String,
      enum: ['conducted', 'cancelled', 'finalized'],
      default: 'conducted',
      index: true,
    },
  },
  { timestamps: true }
);

AttendanceSessionSchema.index(
  { institutionId: 1, courseOfferingId: 1, sessionDate: 1, startTime: 1 },
  { unique: true }
);

export const AttendanceSession = mongoose.model<IAttendanceSession>(
  'AttendanceSession',
  AttendanceSessionSchema
);
