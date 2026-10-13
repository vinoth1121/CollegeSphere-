import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config/env';
import { User, IUser, UserRole } from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export interface AuthRequest extends Request {
  user?: IUser;
  institutionId?: mongoose.Types.ObjectId;
}

interface JwtPayload {
  userId: string;
  institutionId: string;
  roles: UserRole[];
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Session has expired. Please log in again.');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User account not found');
    }

    if (user.accountStatus !== 'active') {
      throw new ForbiddenError(`Account is ${user.accountStatus}. Please contact administration.`);
    }

    req.user = user;
    req.institutionId = user.institutionId;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const hasRole = req.user.roles.some((role) =>
      allowedRoles.includes(role) || req.user?.roles.includes('super_admin')
    );

    if (!hasRole) {
      throw new ForbiddenError(
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`
      );
    }

    next();
  };
}
