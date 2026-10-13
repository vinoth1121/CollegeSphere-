import { Router } from 'express';
import { ExaminationController } from '../controllers/examination.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRole('exam_officer', 'admin', 'super_admin'),
  asyncHandler(ExaminationController.scheduleExam)
);
router.get(
  '/',
  requireRole('exam_officer', 'admin', 'super_admin', 'faculty', 'hod', 'student'),
  asyncHandler(ExaminationController.getExaminations)
);
router.get(
  '/:id/results',
  requireRole('exam_officer', 'admin', 'super_admin', 'faculty', 'hod'),
  asyncHandler(ExaminationController.getExamResults)
);
router.post(
  '/:id/results',
  requireRole('exam_officer', 'admin', 'super_admin', 'faculty'),
  asyncHandler(ExaminationController.submitMarks)
);
router.post(
  '/:id/verify',
  requireRole('exam_officer', 'admin', 'super_admin', 'hod'),
  asyncHandler(ExaminationController.verifyResults)
);
router.post(
  '/:id/publish',
  requireRole('exam_officer', 'admin', 'super_admin'),
  asyncHandler(ExaminationController.publishResults)
);
router.get('/students/:studentId', asyncHandler(ExaminationController.getStudentResults));

export default router;
