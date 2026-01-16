import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
// use require to avoid typing mismatch for express-validator exports
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { validationResult } = require('express-validator');

export function validateRequest(req: Request, _res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err: any) => err.msg).join(', ');
    return next(new ApiError(400, errorMessages || 'Validation failed'));
  }
  return next();
}
