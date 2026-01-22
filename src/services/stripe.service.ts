import Stripe from 'stripe';
import { ApiError } from '../utils/ApiError';
import { IOrder } from '../models/Order.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-12-15.clover' as any,
});

/**
 * Create a Stripe payment intent for an order
 */
export async function createPaymentIntent(order: IOrder): Promise<{
  clientSecret: string;
  paymentIntentId: string;
}> {
  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: order.user.toString(),
      },
      description: `Order ${order.orderNumber}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    throw new ApiError(500, `Stripe payment intent creation failed: ${error.message}`);
  }
}

/**
 * Retrieve a payment intent by ID
 */
export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error: any) {
    throw new ApiError(404, `Payment intent not found: ${error.message}`);
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error: any) {
    throw new ApiError(400, `Payment confirmation failed: ${error.message}`);
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Amount in dollars, if not provided full refund
): Promise<Stripe.Refund> {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    // If amount provided, convert to cents
    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error: any) {
    throw new ApiError(500, `Refund creation failed: ${error.message}`);
  }
}

/**
 * Get refund status
 */
export async function getRefund(refundId: string): Promise<Stripe.Refund> {
  try {
    const refund = await stripe.refunds.retrieve(refundId);
    return refund;
  } catch (error: any) {
    throw new ApiError(404, `Refund not found: ${error.message}`);
  }
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: Buffer | string,
  signature: string,
  webhookSecret: string,
): Stripe.Event {
  try {
    // Handle both Buffer and string payloads
    const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    throw new ApiError(400, `Webhook signature verification failed: ${error.message}`);
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error: any) {
    throw new ApiError(500, `Payment cancellation failed: ${error.message}`);
  }
}

export default stripe;

