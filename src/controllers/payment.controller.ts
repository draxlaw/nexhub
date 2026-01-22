import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as orderService from '../services/order.service';
import * as stripeService from '../services/stripe.service';
import paystackService from '../services/paystack.service';
import { CreatePaymentDto, ConfirmPaymentDto, RefundDto, PaymentStatus } from '../types/order.types';
import { ApiError } from '../utils/ApiError';
import Order from '../models/Order.model';

/**
 * Create a payment for an order
 * POST /api/v1/payments/create
 */
export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, paymentProvider, callbackUrl } = req.body as CreatePaymentDto;

    // Get the order
    const order = await orderService.getOrder(orderId);

    // Check if order can be paid
    if (order.paymentStatus === 'paid') {
      throw new ApiError(400, 'Order is already paid');
    }

    if (order.status === 'cancelled' || order.status === 'refunded') {
      throw new ApiError(400, `Cannot pay for ${order.status} order`);
    }

    let paymentData: any;

    switch (paymentProvider) {
      case 'stripe': {
        const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(order);
        paymentData = {
          provider: 'stripe',
          clientSecret,
          paymentIntentId,
          amount: order.total,
          currency: 'usd',
        };
        break;
      }
      case 'paystack': {
        const frontendUrl = callbackUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
        const callback = `${frontendUrl}/payment/paystack/callback?orderId=${orderId}`;
        const { authorizationUrl, reference } = await paystackService.initializeTransaction(order, callback);
        paymentData = {
          provider: 'paystack',
          authorizationUrl,
          reference,
          amount: order.total,
          currency: 'usd',
        };
        break;
      }
      case 'cod': {
        // Cash on delivery - no payment needed
        paymentData = {
          provider: 'cod',
          message: 'Order placed with cash on delivery',
        };
        break;
      }
      default:
        throw new ApiError(400, 'Invalid payment provider');
    }

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        ...paymentData,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Confirm a payment
 * POST /api/v1/payments/confirm
 */
export async function confirmPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { paymentId, provider, transactionId } = req.body as ConfirmPaymentDto;
    const user = (req as any).user;

    let orderId: string | undefined;
    let paymentStatus: PaymentStatus;
    let transactionRef: string | undefined;
    let order: any;

    switch (provider) {
      case 'stripe': {
        const paymentIntent = await stripeService.retrievePaymentIntent(paymentId);
        transactionRef = paymentIntent.id;
        orderId = paymentIntent.metadata?.orderId;

        if (paymentIntent.status === 'succeeded') {
          paymentStatus = 'paid';
        } else if (paymentIntent.status === 'canceled') {
          paymentStatus = 'failed';
        } else {
          paymentStatus = 'pending';
        }
        break;
      }
      case 'paystack': {
        const transaction = await paystackService.verifyTransaction(paymentId);
        transactionRef = transaction.reference;
        orderId = transaction.metadata?.orderId;

        if (paystackService.isTransactionSuccessful(transaction)) {
          paymentStatus = 'paid';
        } else {
          paymentStatus = 'failed';
        }
        break;
      }
      default:
        throw new ApiError(400, 'Invalid payment provider');
    }

    // Get the order using the orderId from payment metadata
    if (orderId) {
      order = await orderService.getOrder(orderId, user._id.toString());
    } else {
      throw new ApiError(400, 'Order ID not found in payment metadata');
    }

    // Update order payment status
    const updatedOrder = await orderService.updatePaymentStatus(
      order._id.toString(),
      paymentStatus,
      transactionRef,
      user._id.toString(),
    );

    res.status(200).json({
      success: paymentStatus === 'paid',
      message: paymentStatus === 'paid' ? 'Payment confirmed successfully' : 'Payment verification pending',
      data: {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        paymentStatus: updatedOrder.paymentStatus,
        transactionId: transactionRef,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle Stripe webhook
 * POST /api/v1/payments/webhook/stripe
 */
export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new ApiError(500, 'Stripe webhook secret not configured');
    }

    // Use raw body if available (from middleware), otherwise use parsed body
    const payload = (req as any).rawBody || JSON.stringify(req.body);
    const event = stripeService.constructWebhookEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await orderService.updatePaymentStatus(orderId, 'paid', paymentIntent.id);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await orderService.updatePaymentStatus(orderId, 'failed', paymentIntent.id);
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;

        if (paymentIntentId) {
          // Find order by payment intent and update refund status
          const order = await Order.findOne({ paymentId: paymentIntentId });
          if (order) {
            await orderService.updateOrderStatus(order._id.toString(), { status: 'refunded' });
          }
        }
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle Paystack webhook
 * POST /api/v1/payments/webhook/paystack
 */
export async function handlePaystackWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const event = req.body;

    switch (event.event) {
      case 'charge.success': {
        const { metadata, reference } = event.data;
        const orderId = metadata?.orderId;
        
        if (orderId) {
          await orderService.updatePaymentStatus(orderId, 'paid', reference);
        }
        break;
      }
      case 'charge.failure': {
        const { metadata, reference } = event.data;
        const orderId = metadata?.orderId;
        
        if (orderId) {
          await orderService.updatePaymentStatus(orderId, 'failed', reference);
        }
        break;
      }
      case 'refund.created':
      case 'refund.processed': {
        const { transaction } = event.data;
        const order = await Order.findOne({ paymentId: transaction });
        if (order) {
          await orderService.updateOrderStatus(order._id.toString(), { status: 'refunded' });
        }
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Process a refund
 * POST /api/v1/payments/refund
 */
export async function processRefund(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, amount, reason, paymentProvider } = req.body as RefundDto & { orderId: string };
    const order = await orderService.getOrder(orderId);

    // Validate order can be refunded
    if (order.paymentStatus !== 'paid') {
      throw new ApiError(400, 'Only paid orders can be refunded');
    }

    if (order.status === 'refunded') {
      throw new ApiError(400, 'Order is already refunded');
    }

    const refundAmount = amount || order.total;
    let refundResult: any;

    switch (paymentProvider) {
      case 'stripe': {
        if (!order.paymentId) {
          throw new ApiError(400, 'No Stripe payment ID found for this order');
        }
        refundResult = await stripeService.createRefund(order.paymentId, refundAmount);
        break;
      }
      case 'paystack': {
        if (!order.paymentId) {
          throw new ApiError(400, 'No Paystack transaction reference found for this order');
        }
        refundResult = await paystackService.createRefund(order.paymentId, refundAmount, reason);
        break;
      }
      default:
        throw new ApiError(400, 'Invalid payment provider');
    }

    // Update order status to refunded
    const updatedOrder = await orderService.updateOrderStatus(orderId, { status: 'refunded' });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        refundId: refundResult.refundId || refundResult.id,
        amount: refundAmount,
        reason,
        status: 'completed',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get payment status for an order
 * GET /api/v1/payments/status/:orderId
 */
export async function getPaymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const user = (req as any).user;

    const order = await orderService.getOrder(orderId, user._id.toString());

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        paymentId: order.paymentId,
      },
    });
  } catch (err) {
    next(err);
  }
}

