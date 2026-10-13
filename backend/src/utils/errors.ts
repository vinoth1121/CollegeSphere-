export class AppError extends Error {
  public statusCode: number;
  public errors?: Array<{ field?: string; message: string }>;

  constructor(message: string, statusCode: number = 500, errors?: Array<{ field?: string; message: string }>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errors?: Array<{ field?: string; message: string }>) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied. You do not have permission.') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists or violates constraint') {
    super(message, 409);
  }
}
