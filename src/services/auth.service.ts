import User, { IUser } from '../models/User.model';
import RefreshToken from '../models/RefreshToken.model';
import { generateAccessToken, generateRefreshToken, hashToken, refreshTokenExpiryDate } from '../utils/generateToken';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail';
import { ApiError } from '../utils/ApiError';

export async function registerUser(email: string, password: string, name?: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'Email already in use');

  const user = new User({ email, password, name });

  // email verification
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationTokenHash = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

  await user.save();

  // send verification email (link should include token)
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const verifyUrl = `${backendUrl}/api/v1/auth/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  await sendEmail(email, 'Verify your email', `Please verify your account: ${verifyUrl}`);

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user.id, { roles: user.roles });
  const refreshTokenRaw = generateRefreshToken();
  const refreshTokenHashed = hashToken(refreshTokenRaw);
  const rt = new RefreshToken({ user: user._id, tokenHash: refreshTokenHashed, expiresAt: refreshTokenExpiryDate() });
  await rt.save();

  return { accessToken, refreshToken: refreshTokenRaw, user };
}

export async function refreshTokens(refreshTokenRaw: string) {
  const hashed = hashToken(refreshTokenRaw);
  const tokenDoc = await RefreshToken.findOne({ tokenHash: hashed }).populate('user');
  if (!tokenDoc) throw new ApiError(401, 'Invalid refresh token');
  if (!tokenDoc.isActive()) throw new ApiError(401, 'Refresh token expired or revoked');

  // rotation: create new refresh token
  const newRefreshTokenRaw = generateRefreshToken();
  const newRefreshTokenHashed = hashToken(newRefreshTokenRaw);
  const newTokenDoc = new RefreshToken({ user: tokenDoc.user, tokenHash: newRefreshTokenHashed, expiresAt: refreshTokenExpiryDate() });

  // mark previous as replaced
  tokenDoc.revokedAt = new Date();
  tokenDoc.replacedByToken = newRefreshTokenHashed;

  await tokenDoc.save();
  await newTokenDoc.save();

  const userId = (tokenDoc.user as any)?._id ?? tokenDoc.user;
  const user = await User.findById(String(userId));
  const accessToken = generateAccessToken(user!.id, { roles: user!.roles });

  return { accessToken, refreshToken: newRefreshTokenRaw };
}

export async function logout(refreshTokenRaw: string) {
  const hashed = hashToken(refreshTokenRaw);
  const tokenDoc = await RefreshToken.findOne({ tokenHash: hashed });
  if (!tokenDoc) return;
  tokenDoc.revokedAt = new Date();
  await tokenDoc.save();
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email });
  if (!user) return; // don't reveal

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
  const resetUrl = `${backendUrl}/api/v1/auth/password/reset?token=${resetToken}&email=${encodeURIComponent(email)}`;
  await sendEmail(email, 'Password reset', `Reset: ${resetUrl}`);
}

export async function resetPassword(email: string, token: string, newPassword: string) {
  const hashed = hashToken(token);
  const user = await User.findOne({ email, passwordResetTokenHash: hashed });
  if (!user) throw new ApiError(400, 'Invalid or expired token');
  if (!user.passwordResetExpires || user.passwordResetExpires.getTime() < Date.now()) throw new ApiError(400, 'Token expired');

  user.password = newPassword;
  user.passwordResetTokenHash = undefined as any;
  user.passwordResetExpires = undefined as any;
  await user.save();
}

export async function verifyEmail(email: string, token: string) {
  const hashed = hashToken(token);
  const user = await User.findOne({ email, emailVerificationTokenHash: hashed });
  if (!user) throw new ApiError(400, 'Invalid or expired token');
  if (!user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now()) throw new ApiError(400, 'Token expired');

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationTokenHash = undefined as any;
  user.emailVerificationExpires = undefined as any;
  await user.save();
}

export async function getProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}
