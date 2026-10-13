import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Student, User, Enrollment, AttendanceRecord, StudentInvoice } from '../models';
import { BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from './audit.service';

export interface StudentQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  programmeId?: string;
  classId?: string;
  status?: string;
}

export class StudentService {
  static async getStudents(institutionId: mongoose.Types.ObjectId, query: StudentQueryOptions) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = { institutionId };
    if (query.departmentId) filter.departmentId = query.departmentId;
    if (query.programmeId) filter.programmeId = query.programmeId;
    if (query.classId) filter.classId = query.classId;
    if (query.status) filter.studentStatus = query.status;

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { studentNumber: regex },
        { firstName: regex },
        { lastName: regex },
        { 'contact.email': regex },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('departmentId', 'departmentName departmentCode')
        .populate('programmeId', 'programmeName programmeCode')
        .populate('classId', 'className section')
        .populate('currentSemesterId', 'semesterNumber')
        .sort({ studentNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    return {
      students,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getStudentById(institutionId: mongoose.Types.ObjectId, studentId: string) {
    const student = await Student.findOne({ _id: studentId, institutionId })
      .populate('departmentId', 'departmentName departmentCode')
      .populate('programmeId', 'programmeName programmeCode')
      .populate('classId', 'className section')
      .populate('admissionAcademicYearId', 'label')
      .populate('currentSemesterId', 'semesterNumber')
      .lean();

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Get attendance summary
    const [totalSessions, presentSessions] = await Promise.all([
      AttendanceRecord.countDocuments({ institutionId, studentId }),
      AttendanceRecord.countDocuments({ institutionId, studentId, status: { $in: ['present', 'late'] } }),
    ]);
    const attendancePercentage = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

    // Get financial balance
    const invoices = await StudentInvoice.find({ institutionId, studentId }).lean();
    const totalDues = invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);

    return {
      ...student,
      metrics: {
        attendancePercentage,
        totalAttendanceSessions: totalSessions,
        presentAttendanceSessions: presentSessions,
        totalOutstandingDues: totalDues,
      },
    };
  }

  static async admitStudent(
    institutionId: mongoose.Types.ObjectId,
    data: any,
    actorId?: mongoose.Types.ObjectId
  ) {
    const existing = await Student.findOne({
      institutionId,
      studentNumber: data.studentNumber.toUpperCase(),
    });
    if (existing) {
      throw new ConflictError(`Student with roll number ${data.studentNumber} already exists`);
    }

    // Provision User login if email is supplied and login requested
    let userId: mongoose.Types.ObjectId | undefined;
    if (data.contact?.email) {
      const existingUser = await User.findOne({ institutionId, email: data.contact.email.toLowerCase() });
      if (!existingUser) {
        const passwordHash = await bcrypt.hash(data.password || 'Student@123', 10);
        const user = await User.create({
          institutionId,
          email: data.contact.email.toLowerCase(),
          passwordHash,
          roles: ['student'],
          permissions: ['self:read'],
          accountStatus: 'active',
        });
        userId = user._id;
      } else {
        userId = existingUser._id;
      }
    }

    const student = await Student.create({
      ...data,
      institutionId,
      studentNumber: data.studentNumber.toUpperCase(),
      userId,
    });

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'STUDENT_ADMITTED',
      resourceType: 'students',
      resourceId: student._id,
      metadata: { studentNumber: student.studentNumber, name: `${student.firstName} ${student.lastName}` },
    });

    return student;
  }

  static async updateStudent(
    institutionId: mongoose.Types.ObjectId,
    studentId: string,
    data: any,
    actorId?: mongoose.Types.ObjectId
  ) {
    const student = await Student.findOneAndUpdate(
      { _id: studentId, institutionId },
      { $set: data },
      { new: true }
    );
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'STUDENT_UPDATED',
      resourceType: 'students',
      resourceId: student._id,
      metadata: { studentNumber: student.studentNumber },
    });

    return student;
  }

  static async updateStatus(
    institutionId: mongoose.Types.ObjectId,
    studentId: string,
    status: string,
    actorId?: mongoose.Types.ObjectId
  ) {
    const student = await Student.findOneAndUpdate(
      { _id: studentId, institutionId },
      { studentStatus: status },
      { new: true }
    );
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'STUDENT_STATUS_CHANGED',
      resourceType: 'students',
      resourceId: student._id,
      metadata: { studentNumber: student.studentNumber, newStatus: status },
    });

    return student;
  }
}
