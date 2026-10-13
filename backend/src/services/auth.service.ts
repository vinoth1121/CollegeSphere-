import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { Student } from '../models/Student';
import { Faculty } from '../models/Faculty';
import { config } from '../config/env';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../utils/errors';
import { AuditService } from './audit.service';

export class AuthService {
  static generateToken(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        institutionId: user.institutionId.toString(),
        roles: user.roles,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  static async login(
    email: string,
    password: string,
    ipAddress?: string
  ): Promise<{ user: any; token: string }> {
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.accountStatus !== 'active') {
      await AuditService.log({
        institutionId: user.institutionId,
        actorUserId: user._id,
        action: 'LOGIN_FAILED_INACTIVE',
        resourceType: 'users',
        resourceId: user._id,
        ipAddress,
        outcome: 'DENIED',
      });
      throw new UnauthorizedError(
        `Account is ${user.accountStatus}. Please contact administration.`
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await AuditService.log({
        institutionId: user.institutionId,
        actorUserId: user._id,
        action: 'LOGIN_FAILED_PASSWORD',
        resourceType: 'users',
        resourceId: user._id,
        ipAddress,
        outcome: 'FAILURE',
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken(user);

    // Fetch associated entity details if applicable
    let linkedProfile: any = null;
    if (user.roles.includes('student')) {
      linkedProfile = await Student.findOne({ userId: user._id }).lean();
    } else if (user.roles.includes('faculty') || user.roles.includes('hod')) {
      linkedProfile = await Faculty.findOne({ userId: user._id }).lean();
    }

    await AuditService.log({
      institutionId: user.institutionId,
      actorUserId: user._id,
      actorRole: user.roles[0],
      action: 'USER_LOGIN_SUCCESS',
      resourceType: 'users',
      resourceId: user._id,
      ipAddress,
      outcome: 'SUCCESS',
    });

    const userObj = user.toJSON();
    return {
      user: {
        ...userObj,
        profile: linkedProfile,
      },
      token,
    };
  }

  static async getMe(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let linkedProfile: any = null;
    if (user.roles.includes('student')) {
      linkedProfile = await Student.findOne({ userId: user._id })
        .populate('programmeId', 'programmeName programmeCode')
        .populate('departmentId', 'departmentName departmentCode')
        .populate('classId', 'className section')
        .lean();
    } else if (user.roles.includes('faculty') || user.roles.includes('hod')) {
      linkedProfile = await Faculty.findOne({ userId: user._id })
        .populate('departmentId', 'departmentName departmentCode')
        .lean();
    }

    const userObj = user.toJSON();
    return {
      ...userObj,
      profile: linkedProfile,
    };
  }

  static async changePassword(
    userId: string,
    currentPass: string,
    newPass: string,
    ipAddress?: string
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPass, 10);
    await user.save();

    await AuditService.log({
      institutionId: user.institutionId,
      actorUserId: user._id,
      action: 'PASSWORD_CHANGED',
      resourceType: 'users',
      resourceId: user._id,
      ipAddress,
      outcome: 'SUCCESS',
    });
  }

  static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal email existence to prevent user enumeration
      return 'If that email exists in our system, password reset instructions have been sent.';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    return resetToken; // in production, sent via email service
  }

  static async resetPassword(token: string, newPass: string): Promise<void> {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired');
    }

    user.passwordHash = await bcrypt.hash(newPass, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  }
}
