import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import * as cartValidator from '../validators/cart.validator';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

// All cart routes require authentication
router.use(protect);

// Get current user's cart
router.get('/', cartController.getCart);

// Get cart summary (for checkout preview)
router.get('/summary', cartController.getCartSummary);

// Validate cart (check stock, prices, availability)
router.get('/validate', cartController.validateCart);

// Add item to cart
router.post('/items', cartValidator.addItem, validateRequest, cartController.addItem);

// Update cart item quantity
router.put(
  '/items/:productId',
  cartValidator.updateItem,
  validateRequest,
  cartController.updateItem,
);

// Remove item from cart
router.delete(
  '/items/:productId',
  cartValidator.removeItem,
  validateRequest,
  cartController.removeItem,
);

// Clear all items from cart
router.delete('/', cartController.clearCart);

// Apply coupon to cart
router.post('/coupon', cartValidator.applyCoupon, validateRequest, cartController.applyCoupon);

// Remove coupon from cart
router.delete('/coupon', cartController.removeCoupon);

// Sync cart prices with current product prices
router.post('/sync', cartController.syncPrices);

export default router;
