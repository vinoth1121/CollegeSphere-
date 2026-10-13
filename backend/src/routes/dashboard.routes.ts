import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/admin', requireRole('admin', 'super_admin'), asyncHandler(DashboardController.getAdmin));
router.get('/faculty', requireRole('faculty', 'hod', 'admin', 'super_admin'), asyncHandler(DashboardController.getFaculty));
router.get('/student', requireRole('student', 'admin', 'super_admin'), asyncHandler(DashboardController.getStudent));
router.get('/accounts', requireRole('accounts', 'admin', 'super_admin'), asyncHandler(DashboardController.getAccounts));

export default router;
