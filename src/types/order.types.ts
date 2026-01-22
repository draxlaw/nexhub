import { Types } from 'mongoose';

/**
 * Payment provider types
 */
export type PaymentProvider = 'stripe' | 'paystack' | 'cod';

/**
 * Order item representation (frozen cart item)
 */
export interface OrderItemDto {
  product: Types.ObjectId | string;
  quantity: number;
  price: number; // Price at time of order
  finalPrice: number; // Final price after discounts
  name: string; // Product name at time of order
  sku?: string; // Product SKU at time of order
}

/**
 * Order status enum
 */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

/**
 * Payment status enum
 */
export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

/**
 * Create order request body
 */
export interface CreateOrderDto {
  shippingAddress: Types.ObjectId | string;
  billingAddress?: Types.ObjectId | string;
  paymentMethod: string;
  paymentProvider?: PaymentProvider;
  notes?: string;
  couponCode?: string;
}

/**
 * Create payment request
 */
export interface CreatePaymentDto {
  orderId: string;
  paymentProvider: PaymentProvider;
  callbackUrl?: string;
}

/**
 * Confirm payment request
 */
export interface ConfirmPaymentDto {
  paymentId: string;
  provider: PaymentProvider;
  transactionId?: string;
}

/**
 * Process refund request
 */
export interface RefundDto {
  amount?: number; // Partial refund amount, if not provided full refund
  reason: string;
  paymentProvider: PaymentProvider;
}

/**
 * Order filter options for admin
 */
export interface OrderFilterDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentProvider?: PaymentProvider;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string; // Order number, customer name/email
}

/**
 * Order list response for admin with extended info
 */
export interface AdminOrderListItemDto {
  _id: Types.ObjectId;
  orderNumber: string;
  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: PaymentProvider;
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order statistics response for admin dashboard
 */
export interface OrderStatsDto {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  averageOrderValue: number;
  revenueByStatus: {
    [key in OrderStatus]?: number;
  };
  revenueByPaymentProvider: {
    [key in PaymentProvider]?: number;
  };
  recentOrders: AdminOrderListItemDto[];
  topSellingProducts: Array<{
    productId: Types.ObjectId;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

/**
 * Paginated orders response
 */
export interface PaginatedOrdersDto {
  orders: AdminOrderListItemDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Payment initialization response
 */
export interface PaymentInitResponse {
  paymentId: string;
  orderId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  clientSecret?: string; // For Stripe
  authorizationUrl?: string; // For Paystack
  status: PaymentStatus;
}

/**
 * Payment confirmation response
 */
export interface PaymentConfirmResponse {
  success: boolean;
  orderId: string;
  paymentId: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  message: string;
}

/**
 * Refund response
 */
export interface RefundResponse {
  success: boolean;
  orderId: string;
  refundId: string;
  amount: number;
  reason: string;
  refundStatus: 'pending' | 'completed' | 'failed';
  message: string;
}

/**
 * Order summary response
 */
export interface OrderSummaryDto {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  total: number;
  items: OrderItemDto[];
  createdAt: Date;
}

/**
 * Order details response
 */
export interface OrderDetailsDto extends OrderSummaryDto {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentId?: string;
  trackingNumber?: string;
  notes?: string;
  coupon?: Types.ObjectId;
  couponCode?: string;
  couponDiscount?: number;
  updatedAt: Date;
}

/**
 * Update order status request
 */
export interface UpdateOrderStatusDto {
  status: OrderStatus;
  trackingNumber?: string;
}

/**
 * Order list item for user
 */
export interface OrderListItemDto {
  _id: Types.ObjectId;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  itemCount: number;
  createdAt: Date;
}

