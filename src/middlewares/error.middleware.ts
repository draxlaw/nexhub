import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // ApiError - structured errors
  if (err instanceof ApiError) {
    const status = err.statusCode || 500;
    return res.status(status).json({ status: 'error', statusCode: status, message: err.message });
  }

  // Generic errors
  const status = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';
  return res.status(status).json({ status: 'error', statusCode: status, message });
}
