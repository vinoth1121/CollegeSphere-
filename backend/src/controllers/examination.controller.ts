import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ExaminationService } from '../services/examination.service';
import { sendSuccess } from '../utils/response';
import { ForbiddenError } from '../utils/errors';
import { Student } from '../models';

export class ExaminationController {
  static async scheduleExam(req: AuthRequest, res: Response) {
    const exam = await ExaminationService.scheduleExamination(req.institutionId!, req.body, req.user!._id);
    sendSuccess(res, exam, 'Examination scheduled successfully', 201);
  }

  static async getExaminations(req: AuthRequest, res: Response) {
    const filter: any = {};
    if (req.query.courseOfferingId) filter.courseOfferingId = req.query.courseOfferingId;
    if (req.query.status) filter.status = req.query.status;
    const list = await ExaminationService.getExaminations(req.institutionId!, filter);
    sendSuccess(res, list);
  }

  static async getExamResults(req: AuthRequest, res: Response) {
    const data = await ExaminationService.getExamResults(req.institutionId!, req.params.id);
    sendSuccess(res, data);
  }

  static async submitMarks(req: AuthRequest, res: Response) {
    const result = await ExaminationService.submitMarks(
      req.institutionId!,
      req.params.id,
      req.body.marksList,
      req.user!._id
    );
    sendSuccess(res, result, 'Marks submitted successfully');
  }

  static async verifyResults(req: AuthRequest, res: Response) {
    const exam = await ExaminationService.verifyResults(req.institutionId!, req.params.id, req.user!._id);
    sendSuccess(res, exam, 'Results verified successfully');
  }

  static async publishResults(req: AuthRequest, res: Response) {
    const exam = await ExaminationService.publishResults(req.institutionId!, req.params.id, req.user!._id);
    sendSuccess(res, exam, 'Results published to students');
  }

  static async getStudentResults(req: AuthRequest, res: Response) {
    const studentId = req.params.studentId;

    if (req.user?.roles.includes('student') && !req.user?.roles.some(r => ['admin', 'super_admin', 'faculty', 'hod', 'exam_officer'].includes(r))) {
      const selfStudent = await Student.findOne({ userId: req.user._id });
      if (!selfStudent || selfStudent._id.toString() !== studentId) {
        throw new ForbiddenError('You can only access your own academic results');
      }
    }

    const results = await ExaminationService.getStudentResults(req.institutionId!, studentId);
    sendSuccess(res, results);
  }
}
