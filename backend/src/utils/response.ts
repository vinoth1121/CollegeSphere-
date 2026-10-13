import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: Array<{ field?: string; message: string }>;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): void {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  errors?: Array<{ field?: string; message: string }>
): void {
  const payload: ApiResponse = {
    success: false,
    message,
  };
  if (errors && errors.length > 0) {
    payload.errors = errors;
  }
  res.status(statusCode).json(payload);
}
