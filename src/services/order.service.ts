import mongoose from 'mongoose';
import Order, { IOrder, IOrderItem } from '../models/Order.model';
import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import Coupon from '../models/Coupon.model';
import Address from '../models/Address.model';
import User from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { CreateOrderDto, OrderStatus, UpdateOrderStatusDto, OrderFilterDto, OrderStatsDto, AdminOrderListItemDto, PaymentStatus, PaymentProvider } from '../types/order.types';
import * as cartService from './cart.service';

/**
 * Create a new order from cart
 */
export async function createOrder(userId: string, data: CreateOrderDto): Promise<IOrder> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Validate cart
    const { valid, cart, issues } = await cartService.validateCart(userId);
    if (!valid) {
      throw new ApiError(400, `Cart validation failed: ${issues.join(', ')}`);
    }

    if (cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    // 2. Get addresses
    const shippingAddress = await Address.findById(data.shippingAddress);
    if (!shippingAddress) {
      throw new ApiError(404, 'Shipping address not found');
    }

    let billingAddress = shippingAddress;
    if (data.billingAddress) {
      const foundBilling = await Address.findById(data.billingAddress);
      if (!foundBilling) {
        throw new ApiError(404, 'Billing address not found');
      }
      billingAddress = foundBilling;
    }

    // 3. Prepare order items and calculate totals
    const orderItems: IOrderItem[] = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new ApiError(404, `Product ${item.product} not found`);
      }

      // Double check stock within transaction
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      // Decrease stock
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save({ session });

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price,
        finalPrice: item.finalPrice,
        name: product.name,
        sku: product.sku,
      });
    }

    // 4. Handle coupon usage
    if (cart.coupon) {
      const coupon = await Coupon.findById(cart.coupon).session(session);
      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save({ session });
      }
    }

    // 5. Create order
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const order = new Order({
      orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
      },
      billingAddress: {
        name: billingAddress.name,
        phone: billingAddress.phone,
        addressLine1: billingAddress.addressLine1,
        addressLine2: billingAddress.addressLine2,
        city: billingAddress.city,
        state: billingAddress.state,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country,
      },
      paymentMethod: data.paymentMethod,
      paymentProvider: data.paymentProvider,
      paymentStatus: 'pending',
      status: 'pending',
      subtotal: cart.subtotal,
      discount: cart.discount,
      coupon: cart.coupon,
      couponCode: cart.couponCode,
      couponDiscount: cart.couponDiscount,
      total: cart.total,
      notes: data.notes,
    });

    await order.save({ session });

    // 6. Clear cart
    await cartService.deleteCart(userId);

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string, userId?: string): Promise<IOrder> {
  const query: any = { _id: orderId };
  if (userId) {
    query.user = userId;
  }

  const order = await Order.findOne(query)
    .populate('items.product', 'name slug thumbnail')
    .populate('user', 'name email phone');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return order;
}

/**
 * Get user orders
 */
export async function getUserOrders(
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ orders: IOrder[]; total: number; pages: number }> {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name slug thumbnail'),
    Order.countDocuments({ user: userId }),
  ]);

  return {
    orders,
    total,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  data: UpdateOrderStatusDto,
): Promise<IOrder> {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // If cancelling, restore stock
  if (data.status === 'cancelled' && order.status !== 'cancelled') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Use Promise.all to properly await all stock updates within the session
      await Promise.all(
        order.items.map(item =>
          Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity, sold: -item.quantity } },
            { session },
          )
        )
      );

      order.status = data.status;
      if (data.trackingNumber) {
        order.trackingNumber = data.trackingNumber;
      }
      await order.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } else {
    order.status = data.status;
    if (data.trackingNumber) {
      order.trackingNumber = data.trackingNumber;
    }
    await order.save();
  }

  return order;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentId?: string,
  userId?: string,
): Promise<IOrder> {
  const query: any = { _id: orderId };
  if (userId) {
    query.user = userId;
  }

  const order = await Order.findOne(query);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.paymentStatus = paymentStatus;
  if (paymentId) {
    order.paymentId = paymentId;
  }

  // If payment successful, confirm order
  if (paymentStatus === 'paid' && order.status === 'pending') {
    order.status = 'confirmed';
  }

  await order.save();
  return order;
}

/**
 * Cancel order (by user)
 */
export async function cancelOrder(orderId: string, userId: string): Promise<IOrder> {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw new ApiError(400, 'Cannot cancel order in current status');
  }

  return updateOrderStatus(orderId, { status: 'cancelled' });
}

/**
 * Get all orders (Admin)
 */
export async function getAllOrders(
  filters: OrderFilterDto = {},
  page: number = 1,
  limit: number = 10,
): Promise<{ orders: AdminOrderListItemDto[]; total: number; pages: number }> {
  const query: any = {};

  // Apply filters
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }
  if (filters.paymentProvider) {
    query.paymentProvider = filters.paymentProvider;
  }
  if (filters.userId) {
    query.user = filters.userId;
  }
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    query.total = {};
    if (filters.minAmount !== undefined) {
      query.total.$gte = filters.minAmount;
    }
    if (filters.maxAmount !== undefined) {
      query.total.$lte = filters.maxAmount;
    }
  }
  if (filters.search) {
    query.$or = [
      { orderNumber: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .lean(),
    Order.countDocuments(query),
  ]);

  // Transform orders to admin format
  const adminOrders: AdminOrderListItemDto[] = orders.map((order: any) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    user: {
      _id: order.user._id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone,
    },
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentProvider: order.paymentProvider || 'cod',
    total: order.total,
    itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));

  return {
    orders: adminOrders,
    total,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get order statistics (Admin)
 */
export async function getOrderStats(dateRange?: { startDate: Date; endDate: Date }): Promise<OrderStatsDto> {
  const dateQuery: any = {};
  if (dateRange) {
    dateQuery.createdAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    };
  }

  // Get all orders within date range
  const orders = await Order.find(dateQuery).populate('items.product', 'name').lean();

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Count by status
  const statusCounts = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  };

  // Revenue by status
  const revenueByStatus: { [key: string]: number } = {};
  const revenueByProvider: { [key: string]: number } = {};

  for (const order of orders) {
    // Count by status
    if (statusCounts[order.status as keyof typeof statusCounts] !== undefined) {
      statusCounts[order.status as keyof typeof statusCounts]++;
    }

    // Revenue by status
    if (!revenueByStatus[order.status]) {
      revenueByStatus[order.status] = 0;
    }
    revenueByStatus[order.status] += order.total;

    // Revenue by provider
    const provider = order.paymentProvider || 'cod';
    if (!revenueByProvider[provider]) {
      revenueByProvider[provider] = 0;
    }
    revenueByProvider[provider] += order.total;
  }

  // Get recent orders
  const recentOrders = await Order.find(dateQuery)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email')
    .lean();

  const recentOrdersFormatted: AdminOrderListItemDto[] = recentOrders.map((order: any) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    user: {
      _id: order.user._id,
      name: order.user.name,
      email: order.user.email,
    },
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentProvider: order.paymentProvider || 'cod',
    total: order.total,
    itemCount: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));

  // Get top selling products
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  for (const order of orders) {
    if (order.status !== 'cancelled' && order.status !== 'refunded') {
      for (const item of order.items) {
        const productId = item.product.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.finalPrice * item.quantity;
      }
    }
  }

  const topSellingProducts = Object.entries(productSales)
    .map(([productId, data]) => ({
      productId: new mongoose.Types.ObjectId(productId),
      name: data.name,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    totalOrders,
    totalRevenue,
    pendingOrders: statusCounts.pending,
    confirmedOrders: statusCounts.confirmed,
    processingOrders: statusCounts.processing,
    shippedOrders: statusCounts.shipped,
    deliveredOrders: statusCounts.delivered,
    cancelledOrders: statusCounts.cancelled,
    refundedOrders: statusCounts.refunded,
    averageOrderValue,
    revenueByStatus: revenueByStatus as Record<OrderStatus, number>,
    revenueByPaymentProvider: revenueByProvider as Record<PaymentProvider, number>,
    recentOrders: recentOrdersFormatted,
    topSellingProducts,
  };
}

/**
 * Process refund for an order
 */
export async function processRefund(
  orderId: string,
  amount?: number,
  reason?: string,
): Promise<IOrder> {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.paymentStatus !== 'paid') {
    throw new ApiError(400, 'Only paid orders can be refunded');
  }

  if (order.status === 'refunded') {
    throw new ApiError(400, 'Order is already refunded');
  }

  const refundAmount = amount || order.total;

  // Update order status
  if (refundAmount >= order.total) {
    order.status = 'refunded';
    order.paymentStatus = 'refunded';
  } else {
    order.paymentStatus = 'partially_refunded';
  }

  // Restore stock for refunded items
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Use Promise.all to properly await all stock updates within the session
    await Promise.all(
      order.items.map(item =>
        Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity, sold: -item.quantity } },
          { session },
        )
      )
    );

    await order.save({ session });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return order;
}

/**
 * Get single order for admin with full details
 */
export async function getOrderForAdmin(orderId: string): Promise<IOrder> {
  const order = await Order.findById(orderId)
    .populate('items.product', 'name slug thumbnail price')
    .populate('user', 'name email phone')
    .populate('coupon');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  return order;
}

