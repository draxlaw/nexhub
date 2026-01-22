import express, { Router, Request, Response, NextFunction } from 'express';
import * as paymentController from '../controllers/payment.controller';
import * as paymentValidator from '../validators/payment.validator';
import { protect } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

// All payment routes require authentication
router.use(protect);

// ============ PAYMENT OPERATIONS ============

// Create payment for an order
router.post(
  '/create',
  paymentValidator.createPayment,
  validateRequest,
  paymentController.createPayment,
);

// Confirm payment completion
router.post(
  '/confirm',
  paymentValidator.confirmPayment,
  validateRequest,
  paymentController.confirmPayment,
);

// Get payment status for an order
router.get(
  '/status/:orderId',
  paymentController.getPaymentStatus,
);

// Process refund (Admin only)
router.post(
  '/refund',
  requireAdmin,
  paymentValidator.processRefund,
  validateRequest,
  paymentController.processRefund,
);

// ============ WEBHOOKS (No auth required, raw body needed) ============

// Stripe webhook - must be before json body parser and needs raw body
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  (req: Request, res: Response, next: NextFunction) => {
    // Store raw body as string for webhook signature verification
    (req as any).rawBody = req.body.toString();
    next();
  },
  paymentController.handleStripeWebhook,
);

// Paystack webhook
router.post(
  '/webhook/paystack',
  paymentController.handlePaystackWebhook,
);

export default router;

