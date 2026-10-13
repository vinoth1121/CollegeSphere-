import { Router } from 'express';
import { AcademicController } from '../controllers/academic.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticate);

// Departments
router.get('/departments', asyncHandler(AcademicController.getDepartments));
router.post('/departments', requireRole('admin', 'super_admin'), asyncHandler(AcademicController.createDepartment));
router.patch('/departments/:id', requireRole('admin', 'super_admin', 'hod'), asyncHandler(AcademicController.updateDepartment));

// Programmes
router.get('/programmes', asyncHandler(AcademicController.getProgrammes));
router.post('/programmes', requireRole('admin', 'super_admin'), asyncHandler(AcademicController.createProgramme));

// Academic Years & Semesters
router.get('/academic-years', asyncHandler(AcademicController.getAcademicYears));
router.post('/academic-years', requireRole('admin', 'super_admin'), asyncHandler(AcademicController.createAcademicYear));
router.get('/semesters', asyncHandler(AcademicController.getSemesters));
router.post('/semesters', requireRole('admin', 'super_admin'), asyncHandler(AcademicController.createSemester));

// Classes
router.get('/classes', asyncHandler(AcademicController.getClasses));
router.post('/classes', requireRole('admin', 'super_admin', 'hod'), asyncHandler(AcademicController.createClass));

// Courses
router.get('/courses', asyncHandler(AcademicController.getCourses));
router.post('/courses', requireRole('admin', 'super_admin', 'hod'), asyncHandler(AcademicController.createCourse));

// Course Offerings
router.get('/course-offerings', asyncHandler(AcademicController.getCourseOfferings));
router.post('/course-offerings', requireRole('admin', 'super_admin', 'hod'), asyncHandler(AcademicController.createCourseOffering));

// Enrollments
router.get('/enrollments', asyncHandler(AcademicController.getEnrollments));
router.post('/enrollments', requireRole('admin', 'super_admin', 'hod'), asyncHandler(AcademicController.enrollStudent));

export default router;
