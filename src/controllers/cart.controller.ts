import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';
import { ApiError } from '../utils/ApiError';

/**
 * Get current user's cart
 * GET /api/cart
 */
export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const cart = await cartService.getOrCreateCart(user._id.toString());

    res.json({
      success: true,
      cart,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add item to cart
 * POST /api/cart/items
 */
export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { productId, quantity = 1 } = req.body;

    const cart = await cartService.addToCart(user._id.toString(), productId, quantity);

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update cart item quantity
 * PUT /api/cart/items/:productId
 */
export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const productIdParam = req.params.productId;
    const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItem(user._id.toString(), productId, quantity);

    res.json({
      success: true,
      message: 'Cart item updated',
      cart,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove item from cart
 * DELETE /api/cart/items/:productId
 */
export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const productIdParam = req.params.productId;
    const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;

    const cart = await cartService.removeFromCart(user._id.toString(), productId);

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Clear all items from cart
 * DELETE /api/cart
 */
export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;

    const cart = await cartService.clearCart(user._id.toString());

    res.json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Apply coupon to cart
 * POST /api/cart/coupon
 */
export async function applyCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const { couponCode } = req.body;

    const cart = await cartService.applyCoupon(user._id.toString(), couponCode);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      cart,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove coupon from cart
 * DELETE /api/cart/coupon
 */
export async function removeCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;

    const cart = await cartService.removeCoupon(user._id.toString());

    res.json({
      success: true,
      message: 'Coupon removed',
      cart,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Validate cart (check stock, prices, availability)
 * GET /api/cart/validate
 */
export async function validateCart(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;

    const result = await cartService.validateCart(user._id.toString());

    res.json({
      success: true,
      valid: result.valid,
      issues: result.issues,
      cart: result.cart,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get cart summary (for checkout preview)
 * GET /api/cart/summary
 */
export async function getCartSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;

    const summary = await cartService.getCartSummary(user._id.toString());

    res.json({
      success: true,
      summary,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Sync cart prices with current product prices
 * POST /api/cart/sync
 */
export async function syncPrices(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;

    const cart = await cartService.syncCartPrices(user._id.toString());

    res.json({
      success: true,
      message: 'Cart prices synced',
      cart,
    });
  } catch (err) {
    next(err);
  }
}

