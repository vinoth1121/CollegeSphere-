import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { asyncHandler } from '../utils/asyncHandler';
import {
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator';

const router = Router();

router.post('/login', loginValidator, validateRequest, asyncHandler(AuthController.login));
router.get('/me', authenticate, asyncHandler(AuthController.me));
router.post('/change-password', authenticate, changePasswordValidator, validateRequest, asyncHandler(AuthController.changePassword));
router.post('/forgot-password', forgotPasswordValidator, validateRequest, asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', resetPasswordValidator, validateRequest, asyncHandler(AuthController.resetPassword));

export default router;
