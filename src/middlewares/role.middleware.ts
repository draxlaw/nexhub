import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const hasRole = roles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      return next(new ApiError(403, `Requires one of these roles: ${roles.join(', ')}`));
    }

    return next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return next(new ApiError(401, 'Not authenticated'));
  }

  if (!user.roles.includes('admin')) {
    return next(new ApiError(403, 'Admin access required'));
  }

  return next();
}

export function requireVendor(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return next(new ApiError(401, 'Not authenticated'));
  }

  if (!user.roles.includes('vendor')) {
    return next(new ApiError(403, 'Vendor access required'));
  }

  return next();
}
