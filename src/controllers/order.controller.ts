import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../types/order.types';

/**
 * Create a new order
 */
export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const orderData: CreateOrderDto = req.body;

    const order = await orderService.createOrder(user._id.toString(), orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get order by ID
 */
export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = user.role === 'admin' ? undefined : user._id.toString();

    const order = await orderService.getOrder(orderId, userId);

    res.status(200).json({
      success: true,
      message: 'Order details retrieved successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await orderService.getUserOrders(user._id.toString(), page, limit);

    res.status(200).json({
      success: true,
      message: 'User orders retrieved successfully',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updateData: UpdateOrderStatusDto = req.body;

    const order = await orderService.updateOrderStatus(orderId, updateData);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel order (User)
 */
export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    const orderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const order = await orderService.cancelOrder(orderId, user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (err) {
    next(err);
  }
}
