import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FacultyService } from '../services/faculty.service';
import { sendSuccess } from '../utils/response';

export class FacultyController {
  static async getFaculty(req: AuthRequest, res: Response) {
    const result = await FacultyService.getFaculty(req.institutionId!, {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
      departmentId: req.query.departmentId as string,
      status: req.query.status as string,
    });
    sendSuccess(res, result.faculty, 'Faculty retrieved successfully', 200, result.meta);
  }

  static async getFacultyById(req: AuthRequest, res: Response) {
    const member = await FacultyService.getFacultyById(req.institutionId!, req.params.id);
    sendSuccess(res, member);
  }

  static async createFaculty(req: AuthRequest, res: Response) {
    const faculty = await FacultyService.createFaculty(req.institutionId!, req.body, req.user!._id);
    sendSuccess(res, faculty, 'Faculty member created successfully', 201);
  }

  static async updateFaculty(req: AuthRequest, res: Response) {
    const faculty = await FacultyService.updateFaculty(req.institutionId!, req.params.id, req.body, req.user!._id);
    sendSuccess(res, faculty, 'Faculty updated successfully');
  }
}
