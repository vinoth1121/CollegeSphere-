import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StudentService } from '../services/student.service';
import { sendSuccess } from '../utils/response';
import { ForbiddenError } from '../utils/errors';
import { Student } from '../models';

export class StudentController {
  static async getStudents(req: AuthRequest, res: Response) {
    const result = await StudentService.getStudents(req.institutionId!, {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
      departmentId: req.query.departmentId as string,
      programmeId: req.query.programmeId as string,
      classId: req.query.classId as string,
      status: req.query.status as string,
    });
    sendSuccess(res, result.students, 'Students retrieved successfully', 200, result.meta);
  }

  static async getStudentById(req: AuthRequest, res: Response) {
    const studentId = req.params.id;

    // Student role can ONLY view their own record
    if (req.user?.roles.includes('student') && !req.user?.roles.some(r => ['admin', 'super_admin', 'faculty', 'hod'].includes(r))) {
      const selfStudent = await Student.findOne({ userId: req.user._id });
      if (!selfStudent || selfStudent._id.toString() !== studentId) {
        throw new ForbiddenError('You can only access your own student record');
      }
    }

    const student = await StudentService.getStudentById(req.institutionId!, studentId);
    sendSuccess(res, student);
  }

  static async admitStudent(req: AuthRequest, res: Response) {
    const student = await StudentService.admitStudent(req.institutionId!, req.body, req.user!._id);
    sendSuccess(res, student, 'Student admitted successfully', 201);
  }

  static async updateStudent(req: AuthRequest, res: Response) {
    const student = await StudentService.updateStudent(req.institutionId!, req.params.id, req.body, req.user!._id);
    sendSuccess(res, student, 'Student profile updated successfully');
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    const student = await StudentService.updateStatus(req.institutionId!, req.params.id, req.body.status, req.user!._id);
    sendSuccess(res, student, 'Student status updated successfully');
  }
}
