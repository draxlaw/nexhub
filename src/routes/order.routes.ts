import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import * as orderValidator from '../validators/order.validator';
import { protect } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

// All order routes require authentication
router.use(protect);

// Create a new order
router.post(
  '/',
  orderValidator.createOrder,
  validateRequest,
  orderController.createOrder,
);

// Get user orders
router.get('/', orderController.getUserOrders);

// Get order by ID
router.get('/:id', orderController.getOrder);

// Cancel order (User)
router.post('/:id/cancel', orderController.cancelOrder);

// Update order status (Admin only)
router.patch(
  '/:id/status',
  requireAdmin,
  orderValidator.updateOrderStatus,
  validateRequest,
  orderController.updateOrderStatus,
);

export default router;
