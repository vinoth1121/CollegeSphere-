import mongoose from 'mongoose';
import {
  Department,
  Programme,
  AcademicYear,
  Semester,
  Class,
  Course,
  CourseOffering,
  Enrollment,
  Student,
} from '../models';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from './audit.service';

export class AcademicService {
  // --- Departments ---
  static async getDepartments(institutionId: mongoose.Types.ObjectId) {
    return Department.find({ institutionId }).populate('hodUserId', 'email');
  }

  static async createDepartment(institutionId: mongoose.Types.ObjectId, data: any, actorId?: mongoose.Types.ObjectId) {
    const existing = await Department.findOne({ institutionId, departmentCode: data.departmentCode.toUpperCase() });
    if (existing) throw new ConflictError(`Department code ${data.departmentCode} already exists`);

    const dept = await Department.create({ ...data, institutionId, departmentCode: data.departmentCode.toUpperCase() });
    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'DEPARTMENT_CREATED',
      resourceType: 'departments',
      resourceId: dept._id,
      metadata: { code: dept.departmentCode, name: dept.departmentName },
    });
    return dept;
  }

  static async updateDepartment(institutionId: mongoose.Types.ObjectId, id: string, data: any) {
    const dept = await Department.findOneAndUpdate({ _id: id, institutionId }, data, { new: true });
    if (!dept) throw new NotFoundError('Department not found');
    return dept;
  }

  // --- Programmes ---
  static async getProgrammes(institutionId: mongoose.Types.ObjectId, departmentId?: string) {
    const filter: any = { institutionId };
    if (departmentId) filter.departmentId = departmentId;
    return Programme.find(filter).populate('departmentId', 'departmentName departmentCode');
  }

  static async createProgramme(institutionId: mongoose.Types.ObjectId, data: any) {
    const existing = await Programme.findOne({ institutionId, programmeCode: data.programmeCode.toUpperCase() });
    if (existing) throw new ConflictError(`Programme code ${data.programmeCode} already exists`);
    return Programme.create({ ...data, institutionId, programmeCode: data.programmeCode.toUpperCase() });
  }

  // --- Academic Years ---
  static async getAcademicYears(institutionId: mongoose.Types.ObjectId) {
    return AcademicYear.find({ institutionId }).sort({ startDate: -1 });
  }

  static async createAcademicYear(institutionId: mongoose.Types.ObjectId, data: any) {
    const existing = await AcademicYear.findOne({ institutionId, label: data.label });
    if (existing) throw new ConflictError(`Academic year ${data.label} already exists`);
    return AcademicYear.create({ ...data, institutionId });
  }

  // --- Semesters ---
  static async getSemesters(institutionId: mongoose.Types.ObjectId, academicYearId?: string) {
    const filter: any = { institutionId };
    if (academicYearId) filter.academicYearId = academicYearId;
    return Semester.find(filter).sort({ semesterNumber: 1 });
  }

  static async createSemester(institutionId: mongoose.Types.ObjectId, data: any) {
    const existing = await Semester.findOne({
      institutionId,
      academicYearId: data.academicYearId,
      semesterNumber: data.semesterNumber,
    });
    if (existing) throw new ConflictError(`Semester ${data.semesterNumber} already exists in this academic year`);
    return Semester.create({ ...data, institutionId });
  }

  // --- Classes ---
  static async getClasses(institutionId: mongoose.Types.ObjectId, programmeId?: string) {
    const filter: any = { institutionId };
    if (programmeId) filter.programmeId = programmeId;
    return Class.find(filter)
      .populate('programmeId', 'programmeName programmeCode')
      .populate('departmentId', 'departmentName departmentCode')
      .populate('semesterId', 'semesterNumber')
      .populate('classAdvisorId', 'firstName lastName employeeNumber');
  }

  static async createClass(institutionId: mongoose.Types.ObjectId, data: any) {
    return Class.create({ ...data, institutionId });
  }

  // --- Courses ---
  static async getCourses(institutionId: mongoose.Types.ObjectId, departmentId?: string) {
    const filter: any = { institutionId };
    if (departmentId) filter.departmentId = departmentId;
    return Course.find(filter).populate('departmentId', 'departmentName departmentCode');
  }

  static async createCourse(institutionId: mongoose.Types.ObjectId, data: any) {
    const existing = await Course.findOne({ institutionId, courseCode: data.courseCode.toUpperCase() });
    if (existing) throw new ConflictError(`Course code ${data.courseCode} already exists`);
    return Course.create({ ...data, institutionId, courseCode: data.courseCode.toUpperCase() });
  }

  // --- Course Offerings ---
  static async getCourseOfferings(institutionId: mongoose.Types.ObjectId, filter: any = {}) {
    return CourseOffering.find({ institutionId, ...filter })
      .populate('courseId', 'courseCode courseName credits courseType')
      .populate('academicYearId', 'label')
      .populate('semesterId', 'semesterNumber')
      .populate('classId', 'className section')
      .populate('facultyIds', 'firstName lastName employeeNumber');
  }

  static async createCourseOffering(institutionId: mongoose.Types.ObjectId, data: any) {
    return CourseOffering.create({ ...data, institutionId });
  }

  // --- Enrollments ---
  static async getEnrollments(institutionId: mongoose.Types.ObjectId, filter: any = {}) {
    return Enrollment.find({ institutionId, ...filter })
      .populate('studentId', 'studentNumber firstName lastName')
      .populate({
        path: 'courseOfferingId',
        populate: [
          { path: 'courseId', select: 'courseCode courseName credits' },
          { path: 'classId', select: 'className section' },
          { path: 'semesterId', select: 'semesterNumber' },
        ],
      });
  }

  static async enrollStudent(institutionId: mongoose.Types.ObjectId, studentId: string, courseOfferingId: string, actorId?: mongoose.Types.ObjectId) {
    const offering = await CourseOffering.findOne({ _id: courseOfferingId, institutionId });
    if (!offering) throw new NotFoundError('Course offering not found');

    if (offering.enrolledCount >= offering.capacity) {
      throw new BadRequestError('Course offering has reached maximum capacity');
    }

    const existing = await Enrollment.findOne({ institutionId, studentId, courseOfferingId });
    if (existing) {
      if (existing.status === 'enrolled') {
        throw new ConflictError('Student is already actively enrolled in this course offering');
      }
      existing.status = 'enrolled';
      await existing.save();
      return existing;
    }

    const enrollment = await Enrollment.create({
      institutionId,
      studentId,
      courseOfferingId,
      status: 'enrolled',
      createdBy: actorId,
    });

    // Increment enrolled count
    offering.enrolledCount += 1;
    await offering.save();

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'STUDENT_ENROLLED',
      resourceType: 'enrollments',
      resourceId: enrollment._id,
      metadata: { studentId, courseOfferingId },
    });

    return enrollment;
  }
}
