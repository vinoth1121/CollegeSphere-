import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Faculty, User } from '../models';
import { NotFoundError, ConflictError } from '../utils/errors';
import { AuditService } from './audit.service';

export interface FacultyQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
}

export class FacultyService {
  static async getFaculty(institutionId: mongoose.Types.ObjectId, query: FacultyQueryOptions) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = { institutionId };
    if (query.departmentId) filter.departmentId = query.departmentId;
    if (query.status) filter.employmentStatus = query.status;

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { employeeNumber: regex },
        { firstName: regex },
        { lastName: regex },
        { 'contact.email': regex },
      ];
    }

    const [faculty, total] = await Promise.all([
      Faculty.find(filter)
        .populate('departmentId', 'departmentName departmentCode')
        .populate('assignedSubjects', 'courseCode courseName')
        .sort({ employeeNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Faculty.countDocuments(filter),
    ]);

    return {
      faculty,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getFacultyById(institutionId: mongoose.Types.ObjectId, id: string) {
    const member = await Faculty.findOne({ _id: id, institutionId })
      .populate('departmentId', 'departmentName departmentCode')
      .populate('assignedSubjects', 'courseCode courseName credits')
      .lean();

    if (!member) {
      throw new NotFoundError('Faculty member not found');
    }
    return member;
  }

  static async createFaculty(
    institutionId: mongoose.Types.ObjectId,
    data: any,
    actorId?: mongoose.Types.ObjectId
  ) {
    const existing = await Faculty.findOne({
      institutionId,
      employeeNumber: data.employeeNumber.toUpperCase(),
    });
    if (existing) {
      throw new ConflictError(`Faculty member with employee ID ${data.employeeNumber} already exists`);
    }

    // Provision User login
    let userId: mongoose.Types.ObjectId;
    const existingUser = await User.findOne({ institutionId, email: data.contact.email.toLowerCase() });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash(data.password || 'Faculty@123', 10);
      const user = await User.create({
        institutionId,
        email: data.contact.email.toLowerCase(),
        passwordHash,
        roles: data.isHod ? ['hod', 'faculty'] : ['faculty'],
        permissions: ['attendance:record', 'results:enter'],
        accountStatus: 'active',
      });
      userId = user._id;
    } else {
      userId = existingUser._id;
    }

    const faculty = await Faculty.create({
      ...data,
      institutionId,
      employeeNumber: data.employeeNumber.toUpperCase(),
      userId,
    });

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'FACULTY_CREATED',
      resourceType: 'faculty',
      resourceId: faculty._id,
      metadata: { employeeNumber: faculty.employeeNumber, name: `${faculty.firstName} ${faculty.lastName}` },
    });

    return faculty;
  }

  static async updateFaculty(
    institutionId: mongoose.Types.ObjectId,
    id: string,
    data: any,
    actorId?: mongoose.Types.ObjectId
  ) {
    const faculty = await Faculty.findOneAndUpdate(
      { _id: id, institutionId },
      { $set: data },
      { new: true }
    );
    if (!faculty) {
      throw new NotFoundError('Faculty member not found');
    }

    await AuditService.log({
      institutionId,
      actorUserId: actorId,
      action: 'FACULTY_UPDATED',
      resourceType: 'faculty',
      resourceId: faculty._id,
      metadata: { employeeNumber: faculty.employeeNumber },
    });

    return faculty;
  }
}
