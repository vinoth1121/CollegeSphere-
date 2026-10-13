import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post(
  '/sessions',
  requireRole('faculty', 'hod', 'admin', 'super_admin'),
  asyncHandler(AttendanceController.createSession)
);
router.get(
  '/sessions',
  requireRole('faculty', 'hod', 'admin', 'super_admin'),
  asyncHandler(AttendanceController.getSessions)
);
router.get(
  '/sessions/:id',
  requireRole('faculty', 'hod', 'admin', 'super_admin'),
  asyncHandler(AttendanceController.getSessionWithRecords)
);
router.post(
  '/sessions/:id/records',
  requireRole('faculty', 'hod', 'admin', 'super_admin'),
  asyncHandler(AttendanceController.recordBulk)
);
router.post(
  '/records/:id/correct',
  requireRole('faculty', 'hod', 'admin', 'super_admin'),
  asyncHandler(AttendanceController.correctRecord)
);
router.get('/students/:studentId', asyncHandler(AttendanceController.getStudentAttendance));

export default router;
