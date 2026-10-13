import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { BadRequestError } from '../utils/errors';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err: any) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    throw new BadRequestError('Validation failed', formatted);
  }
  next();
}
