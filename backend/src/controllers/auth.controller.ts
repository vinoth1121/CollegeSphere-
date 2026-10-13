import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export class AuthController {
  static async login(req: AuthRequest, res: Response): Promise<void> {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    const result = await AuthService.login(email, password, ip);
    sendSuccess(res, result, 'Login successful');
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!._id.toString();
    const result = await AuthService.getMe(userId);
    sendSuccess(res, result, 'Current user profile retrieved');
  }

  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!._id.toString();
    const { currentPassword, newPassword } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    await AuthService.changePassword(userId, currentPassword, newPassword, ip);
    sendSuccess(res, null, 'Password updated successfully');
  }

  static async forgotPassword(req: AuthRequest, res: Response): Promise<void> {
    const { email } = req.body;
    const token = await AuthService.forgotPassword(email);
    // In dev/demo, we return token for ease of testing
    sendSuccess(res, { resetToken: token }, 'Reset instructions processed');
  }

  static async resetPassword(req: AuthRequest, res: Response): Promise<void> {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword(token, newPassword);
    sendSuccess(res, null, 'Password has been reset successfully');
  }
}
