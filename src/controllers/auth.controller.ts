import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { ApiError } from '../utils/ApiError';
import User from '../models/User.model';
import { hashToken } from '../utils/generateToken';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const user = await authService.registerUser({ email, password, firstName, lastName, role });
    return res.status(201).json({ success: true, user });
  } catch (err) {
    console.log(err)
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.loginUser(email, password);

    // Return both accessToken and token (alias) for frontend compatibility
    const token = accessToken;

    // set httpOnly cookie if configured
    if (process.env.USE_REFRESH_TOKEN_COOKIE === 'true') {
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      return res.json({ success: true, accessToken, token, user });
    }

    res.json({ success: true, accessToken, token, refreshToken, user });
    return;
  } catch (err) {
    return next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token) throw new ApiError(400, 'Missing refresh token');
    const { accessToken, refreshToken } = await authService.refreshTokens(token);

    if (process.env.USE_REFRESH_TOKEN_COOKIE === 'true') {
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.json({ success: true, accessToken });
      return;
    }

    res.json({ success: true, accessToken, refreshToken });
    return;
  } catch (err) {
    return next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    // Handle both GET (from email link) and POST (from API)
    const email = req.body.email || req.query.email as string;
    const token = req.body.token || req.query.token as string;
    const password = req.body.password;

    if (!email || !token) {
      return next(new ApiError(400, 'Email and token are required'));
    }

    // Verify token validity
    const hashed = hashToken(token);
    const user = await User.findOne({ email, passwordResetTokenHash: hashed });
    if (!user) return next(new ApiError(400, 'Invalid or expired token'));
    if (!user.passwordResetExpires || user.passwordResetExpires.getTime() < Date.now()) {
      return next(new ApiError(400, 'Token expired'));
    }

    // GET request (from email link) - only verify token
    if (req.method === 'GET') {
      return res.json({ success: true, message: 'Token is valid. Submit new password.' });
    }

    // POST request (from API) - reset password
    if (!password) {
      return next(new ApiError(400, 'Password is required'));
    }
    await authService.resetPassword(email, token, password);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, token } = req.query as { email: string; token: string };
    await authService.verifyEmail(email, token);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile((req as any).user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}
