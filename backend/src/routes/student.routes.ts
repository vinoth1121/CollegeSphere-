import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('admin', 'super_admin', 'faculty', 'hod', 'exam_officer', 'accounts'),
  asyncHandler(StudentController.getStudents)
);
router.post('/', requireRole('admin', 'super_admin'), asyncHandler(StudentController.admitStudent));
router.get('/:id', asyncHandler(StudentController.getStudentById));
router.patch('/:id', requireRole('admin', 'super_admin', 'hod'), asyncHandler(StudentController.updateStudent));
router.post('/:id/status', requireRole('admin', 'super_admin'), asyncHandler(StudentController.updateStatus));

export default router;
