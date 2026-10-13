import mongoose from 'mongoose';
import { AttendanceSession, AttendanceRecord, CourseOffering, Student, Faculty } from '../models';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuditService } from './audit.service';

export interface BulkRecordInput {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export class AttendanceService {
  static async createSession(
    institutionId: mongoose.Types.ObjectId,
    data: any,
    actorId?: mongoose.Types.ObjectId,
    actorRoles: string[] = []
  ) {
    const offering = await CourseOffering.findOne({ _id: data.courseOfferingId, institutionId });
    if (!offering) throw new NotFoundError('Course offering not found');

    // If faculty, verify faculty assignment
    if (!actorRoles.includes('admin') && !actorRoles.includes('super_admin') && !actorRoles.includes('hod')) {
      const faculty = await Faculty.findOne({ userId: actorId });
      if (!faculty || !offering.facultyIds.some((f) => f.toString() === faculty._id.toString())) {
        throw new ForbiddenError('You are not assigned to instruct this course offering');
      }
    }

    const session = await AttendanceSession.create({
      ...data,
      institutionId,
      sessionDate: new Date(data.sessionDate),
    });

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'ATTENDANCE_SESSION_CREATED',
      resourceType: 'attendanceSessions',
      resourceId: session._id,
      metadata: { courseOfferingId: data.courseOfferingId, date: data.sessionDate },
    });

    return session;
  }

  static async getSessions(institutionId: mongoose.Types.ObjectId, filter: any = {}) {
    return AttendanceSession.find({ institutionId, ...filter })
      .populate({
        path: 'courseOfferingId',
        populate: [
          { path: 'courseId', select: 'courseCode courseName' },
          { path: 'classId', select: 'className section' },
        ],
      })
      .populate('facultyId', 'firstName lastName employeeNumber')
      .sort({ sessionDate: -1 });
  }

  static async getSessionWithRecords(institutionId: mongoose.Types.ObjectId, sessionId: string) {
    const session = await AttendanceSession.findOne({ _id: sessionId, institutionId })
      .populate({
        path: 'courseOfferingId',
        populate: [
          { path: 'courseId', select: 'courseCode courseName' },
          { path: 'classId', select: 'className section' },
        ],
      })
      .populate('facultyId', 'firstName lastName')
      .lean();

    if (!session) throw new NotFoundError('Attendance session not found');

    const records = await AttendanceRecord.find({ institutionId, attendanceSessionId: sessionId })
      .populate('studentId', 'studentNumber firstName lastName')
      .lean();

    return { session, records };
  }

  static async recordBulkAttendance(
    institutionId: mongoose.Types.ObjectId,
    sessionId: string,
    records: BulkRecordInput[],
    actorId: mongoose.Types.ObjectId
  ) {
    const session = await AttendanceSession.findOne({ _id: sessionId, institutionId });
    if (!session) throw new NotFoundError('Attendance session not found');

    const ops: any[] = records.map((rec) => ({
      updateOne: {
        filter: {
          institutionId,
          attendanceSessionId: session._id,
          studentId: rec.studentId,
        },
        update: {
          $set: {
            status: rec.status,
            recordedBy: actorId,
            recordedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await AttendanceRecord.bulkWrite(ops);

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'ATTENDANCE_RECORDED',
      resourceType: 'attendanceSessions',
      resourceId: session._id,
      metadata: { recordsCount: records.length, upserted: result.upsertedCount, modified: result.modifiedCount },
    });

    return result;
  }

  static async correctAttendance(
    institutionId: mongoose.Types.ObjectId,
    recordId: string,
    newStatus: 'present' | 'absent' | 'late' | 'excused',
    reason: string,
    actorId: mongoose.Types.ObjectId
  ) {
    const record = await AttendanceRecord.findOne({ _id: recordId, institutionId });
    if (!record) throw new NotFoundError('Attendance record not found');

    const prevStatus = record.status;
    record.status = newStatus;
    record.correctionHistory.push({
      previousStatus: prevStatus,
      updatedStatus: newStatus,
      reason,
      correctedBy: actorId,
      correctedAt: new Date(),
    });
    await record.save();

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'ATTENDANCE_CORRECTED',
      resourceType: 'attendanceRecords',
      resourceId: record._id,
      metadata: { from: prevStatus, to: newStatus, reason },
    });

    return record;
  }

  static async getStudentAttendance(institutionId: mongoose.Types.ObjectId, studentId: string) {
    const records = await AttendanceRecord.find({ institutionId, studentId })
      .populate({
        path: 'attendanceSessionId',
        populate: {
          path: 'courseOfferingId',
          populate: { path: 'courseId', select: 'courseCode courseName' },
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    const total = records.length;
    const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    return {
      percentage,
      total,
      present,
      absent,
      excused,
      records,
    };
  }
}
