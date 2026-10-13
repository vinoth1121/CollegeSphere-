import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AttendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/response';
import { ForbiddenError } from '../utils/errors';
import { Student } from '../models';

export class AttendanceController {
  static async createSession(req: AuthRequest, res: Response) {
    const session = await AttendanceService.createSession(
      req.institutionId!,
      req.body,
      req.user!._id,
      req.user!.roles
    );
    sendSuccess(res, session, 'Attendance session created', 201);
  }

  static async getSessions(req: AuthRequest, res: Response) {
    const filter: any = {};
    if (req.query.courseOfferingId) filter.courseOfferingId = req.query.courseOfferingId;
    if (req.query.facultyId) filter.facultyId = req.query.facultyId;
    const list = await AttendanceService.getSessions(req.institutionId!, filter);
    sendSuccess(res, list);
  }

  static async getSessionWithRecords(req: AuthRequest, res: Response) {
    const data = await AttendanceService.getSessionWithRecords(req.institutionId!, req.params.id);
    sendSuccess(res, data);
  }

  static async recordBulk(req: AuthRequest, res: Response) {
    const result = await AttendanceService.recordBulkAttendance(
      req.institutionId!,
      req.params.id,
      req.body.records,
      req.user!._id
    );
    sendSuccess(res, result, 'Attendance recorded successfully');
  }

  static async correctRecord(req: AuthRequest, res: Response) {
    const { status, reason } = req.body;
    const record = await AttendanceService.correctAttendance(
      req.institutionId!,
      req.params.id,
      status,
      reason,
      req.user!._id
    );
    sendSuccess(res, record, 'Attendance record updated with audit trace');
  }

  static async getStudentAttendance(req: AuthRequest, res: Response) {
    const studentId = req.params.studentId;

    if (req.user?.roles.includes('student') && !req.user?.roles.some(r => ['admin', 'super_admin', 'faculty', 'hod'].includes(r))) {
      const selfStudent = await Student.findOne({ userId: req.user._id });
      if (!selfStudent || selfStudent._id.toString() !== studentId) {
        throw new ForbiddenError('You can only view your own attendance records');
      }
    }

    const summary = await AttendanceService.getStudentAttendance(req.institutionId!, studentId);
    sendSuccess(res, summary);
  }
}
