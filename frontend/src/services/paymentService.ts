import api from './api';

// Types based on backend Payment model
export interface CreatePaymentData {
  orderId: string;
  paymentMethod: 'stripe' | 'paystack';
}

export interface Payment {
  _id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  providerResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatus {
  paymentId: string;
  orderId: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  amount: number;
  currency: string;
}

export interface RefundData {
  orderId: string;
  amount?: number; // Optional, full refund if not specified
  reason?: string;
}

export const paymentService = {
  // Create a payment for an order
  async createPayment(data: CreatePaymentData): Promise<{ clientSecret?: string; paymentId: string; provider: string }> {
    const response = await api.post('/payments/create', data);
    return response.data;
  },

  // Confirm payment completion
  async confirmPayment(paymentId: string, transactionId: string): Promise<Payment> {
    const response = await api.post('/payments/confirm', { paymentId, transactionId });
    return response.data;
  },

  // Get payment status for an order
  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },

  // Process refund (admin only)
  async processRefund(data: RefundData): Promise<Payment> {
    const response = await api.post('/payments/refund', data);
    return response.data;
  },

  // Initialize Stripe payment (returns Stripe elements config)
  async initializeStripe(orderId: string): Promise<{ publishableKey: string; amount: number; currency: string }> {
    const response = await api.post('/payments/stripe/initialize', { orderId });
    return response.data;
  },

  // Initialize Paystack payment
  async initializePaystack(orderId: string): Promise<{ authorizationUrl: string; reference: string }> {
    const response = await api.post('/payments/paystack/initialize', { orderId });
    return response.data;
  },

  // Verify Paystack payment
  async verifyPaystackPayment(reference: string): Promise<Payment> {
    const response = await api.post('/payments/paystack/verify', { reference });
    return response.data;
  },

  // Get payment history for user
  async getPaymentHistory(page: number = 1, limit: number = 10): Promise<{ payments: Payment[]; total: number }> {
    const response = await api.get(`/payments/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single payment details
  async getPayment(paymentId: string): Promise<Payment> {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
};

export default paymentService;

