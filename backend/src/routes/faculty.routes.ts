import { Router } from 'express';
import { FacultyController } from '../controllers/faculty.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole('admin', 'super_admin', 'faculty', 'hod', 'exam_officer'),
  asyncHandler(FacultyController.getFaculty)
);
router.post('/', requireRole('admin', 'super_admin'), asyncHandler(FacultyController.createFaculty));
router.get('/:id', asyncHandler(FacultyController.getFacultyById));
router.patch('/:id', requireRole('admin', 'super_admin', 'hod'), asyncHandler(FacultyController.updateFaculty));

export default router;
