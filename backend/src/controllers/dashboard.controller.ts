import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  static async getAdmin(req: AuthRequest, res: Response) {
    const data = await DashboardService.getAdminDashboard(req.institutionId!);
    sendSuccess(res, data);
  }

  static async getFaculty(req: AuthRequest, res: Response) {
    const data = await DashboardService.getFacultyDashboard(req.institutionId!, req.user!._id);
    sendSuccess(res, data);
  }

  static async getStudent(req: AuthRequest, res: Response) {
    const data = await DashboardService.getStudentDashboard(req.institutionId!, req.user!._id);
    sendSuccess(res, data);
  }

  static async getAccounts(req: AuthRequest, res: Response) {
    const data = await DashboardService.getAccountsDashboard(req.institutionId!);
    sendSuccess(res, data);
  }
}
