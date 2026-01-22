import api from './api';

// Types based on backend Order model
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: {
    size?: string;
    color?: string;
  };
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: 'stripe' | 'paystack';
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

export const orderService = {
  // Create a new order
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user orders with pagination
  async getUserOrders(page: number = 1, limit: number = 10): Promise<OrderListResponse> {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single order by ID
  async getOrder(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Cancel an order
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Update order status (admin only)
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get recent orders (for quick access)
  async getRecentOrders(limit: number = 5): Promise<Order[]> {
    const response = await api.get(`/orders?limit=${limit}`);
    return response.data.orders || response.data;
  },

  // Track order status
  async trackOrder(orderId: string): Promise<{ status: string; timeline: Array<{ status: string; date: string }> }> {
    const response = await api.get(`/orders/${orderId}/track`);
    return response.data;
  },
};

export default orderService;

