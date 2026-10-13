import mongoose, { Schema, Document } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface ICorrectionHistory {
  previousStatus: AttendanceStatus;
  updatedStatus: AttendanceStatus;
  reason: string;
  correctedBy: mongoose.Types.ObjectId;
  correctedAt: Date;
}

export interface IAttendanceRecord extends Document {
  institutionId: mongoose.Types.ObjectId;
  attendanceSessionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: AttendanceStatus;
  recordedBy: mongoose.Types.ObjectId;
  recordedAt: Date;
  correctionHistory: ICorrectionHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    attendanceSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
      index: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'present',
      index: true,
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordedAt: { type: Date, default: Date.now },
    correctionHistory: [
      {
        previousStatus: { type: String, enum: ['present', 'absent', 'late', 'excused'] },
        updatedStatus: { type: String, enum: ['present', 'absent', 'late', 'excused'] },
        reason: { type: String, required: true },
        correctedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        correctedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

AttendanceRecordSchema.index(
  { institutionId: 1, attendanceSessionId: 1, studentId: 1 },
  { unique: true }
);

export const AttendanceRecord = mongoose.model<IAttendanceRecord>(
  'AttendanceRecord',
  AttendanceRecordSchema
);
