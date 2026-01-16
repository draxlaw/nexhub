import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { ApiError } from '../utils/ApiError';

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_strong_secret';

export async function protect(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next(new ApiError(401, 'Not authorized'));
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(payload.sub);
    if (!user) return next(new ApiError(401, 'Not authorized'));
    (req as any).user = user;
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Not authorized'));
  }
}
