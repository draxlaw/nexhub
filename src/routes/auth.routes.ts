import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as authValidator from '../validators/auth.validator';
import { protect } from '../middlewares/auth.middleware';
import passport from 'passport';

const router = Router();

import { validateRequest } from '../middlewares/validation.middleware';

router.post('/register', authValidator.register, validateRequest, authController.register);
router.post('/login', authValidator.login, validateRequest, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/password/forgot', authController.forgotPassword);
router.get('/password/reset', authController.resetPassword);  // GET for email link
router.post('/password/reset', authController.resetPassword); // POST for API
router.get('/verify', authController.verifyEmail);
router.get('/me', protect, authController.me);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
  // Redirect or respond with token depending on app flow
  res.json({ success: true, user: (req as any).user });
});

export default router;
