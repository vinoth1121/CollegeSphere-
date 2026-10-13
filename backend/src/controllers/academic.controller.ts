import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AcademicService } from '../services/academic.service';
import { sendSuccess } from '../utils/response';

export class AcademicController {
  // Departments
  static async getDepartments(req: AuthRequest, res: Response) {
    const list = await AcademicService.getDepartments(req.institutionId!);
    sendSuccess(res, list);
  }

  static async createDepartment(req: AuthRequest, res: Response) {
    const dept = await AcademicService.createDepartment(req.institutionId!, req.body, req.user!._id);
    sendSuccess(res, dept, 'Department created successfully', 201);
  }

  static async updateDepartment(req: AuthRequest, res: Response) {
    const dept = await AcademicService.updateDepartment(req.institutionId!, req.params.id, req.body);
    sendSuccess(res, dept, 'Department updated successfully');
  }

  // Programmes
  static async getProgrammes(req: AuthRequest, res: Response) {
    const list = await AcademicService.getProgrammes(req.institutionId!, req.query.departmentId as string);
    sendSuccess(res, list);
  }

  static async createProgramme(req: AuthRequest, res: Response) {
    const prog = await AcademicService.createProgramme(req.institutionId!, req.body);
    sendSuccess(res, prog, 'Programme created successfully', 201);
  }

  // Academic Years
  static async getAcademicYears(req: AuthRequest, res: Response) {
    const list = await AcademicService.getAcademicYears(req.institutionId!);
    sendSuccess(res, list);
  }

  static async createAcademicYear(req: AuthRequest, res: Response) {
    const ay = await AcademicService.createAcademicYear(req.institutionId!, req.body);
    sendSuccess(res, ay, 'Academic Year created successfully', 201);
  }

  // Semesters
  static async getSemesters(req: AuthRequest, res: Response) {
    const list = await AcademicService.getSemesters(req.institutionId!, req.query.academicYearId as string);
    sendSuccess(res, list);
  }

  static async createSemester(req: AuthRequest, res: Response) {
    const sem = await AcademicService.createSemester(req.institutionId!, req.body);
    sendSuccess(res, sem, 'Semester created successfully', 201);
  }

  // Classes
  static async getClasses(req: AuthRequest, res: Response) {
    const list = await AcademicService.getClasses(req.institutionId!, req.query.programmeId as string);
    sendSuccess(res, list);
  }

  static async createClass(req: AuthRequest, res: Response) {
    const cls = await AcademicService.createClass(req.institutionId!, req.body);
    sendSuccess(res, cls, 'Class created successfully', 201);
  }

  // Courses
  static async getCourses(req: AuthRequest, res: Response) {
    const list = await AcademicService.getCourses(req.institutionId!, req.query.departmentId as string);
    sendSuccess(res, list);
  }

  static async createCourse(req: AuthRequest, res: Response) {
    const course = await AcademicService.createCourse(req.institutionId!, req.body);
    sendSuccess(res, course, 'Course created successfully', 201);
  }

  // Course Offerings
  static async getCourseOfferings(req: AuthRequest, res: Response) {
    const filter: any = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.semesterId) filter.semesterId = req.query.semesterId;
    if (req.query.facultyId) filter.facultyIds = req.query.facultyId;
    const list = await AcademicService.getCourseOfferings(req.institutionId!, filter);
    sendSuccess(res, list);
  }

  static async createCourseOffering(req: AuthRequest, res: Response) {
    const offering = await AcademicService.createCourseOffering(req.institutionId!, req.body);
    sendSuccess(res, offering, 'Course Offering created successfully', 201);
  }

  // Enrollments
  static async getEnrollments(req: AuthRequest, res: Response) {
    const filter: any = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.courseOfferingId) filter.courseOfferingId = req.query.courseOfferingId;
    const list = await AcademicService.getEnrollments(req.institutionId!, filter);
    sendSuccess(res, list);
  }

  static async enrollStudent(req: AuthRequest, res: Response) {
    const { studentId, courseOfferingId } = req.body;
    const enrollment = await AcademicService.enrollStudent(
      req.institutionId!,
      studentId,
      courseOfferingId,
      req.user!._id
    );
    sendSuccess(res, enrollment, 'Enrolled successfully', 201);
  }
}
