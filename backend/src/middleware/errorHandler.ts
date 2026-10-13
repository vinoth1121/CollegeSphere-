import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  logger.error(`Error on ${req.method} ${req.originalUrl}: ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle custom AppError
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern || {});
    const field = keys.length > 0 ? keys.join(', ') : 'field';
    sendError(res, `A record with this ${field} already exists.`, 409, [
      { field, message: `Duplicate value provided for ${field}` },
    ]);
    return;
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    const formattedErrors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    sendError(res, 'Validation error occurred', 400, formattedErrors);
    return;
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, `Invalid ID format for ${err.path}`, 400, [
      { field: err.path, message: 'Invalid identifier format' },
    ]);
    return;
  }

  // Default internal server error
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred'
      : err.message || 'Internal server error';

  sendError(res, message, 500);
}
