import axios, { AxiosInstance } from 'axios';
import { ApiError } from '../utils/ApiError';
import { IOrder } from '../models/Order.model';

interface PaystackTransaction {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  metadata: Record<string, any>;
  gateway_response: string;
  paid_at: string;
  created_at: string;
}

interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: PaystackTransaction;
}

interface CreateRefundResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    transaction_reference: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  };
}

class PaystackService {
  private client: AxiosInstance;
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize a transaction for an order
   */
  async initializeTransaction(
    order: IOrder,
    callbackUrl: string,
  ): Promise<{
    authorizationUrl: string;
    reference: string;
    accessCode: string;
  }> {
    try {
      const response = await this.client.post<InitializeTransactionResponse>('/transaction/initialize', {
        amount: Math.round(order.total * 100), // Convert to kobo
        email: (order.user as any).email || 'customer@example.com',
        reference: `ORD-${order.orderNumber}-${Date.now()}`,
        callback_url: callbackUrl,
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          userId: order.user.toString(),
        },
        channels: ['card', 'bank_transfer', 'ussd', 'qr'],
      });

      if (!response.data.status) {
        throw new ApiError(400, `Paystack initialization failed: ${response.data.message}`);
      }

      return {
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
        accessCode: response.data.data.access_code,
      };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Paystack transaction initialization failed: ${error.message}`);
    }
  }

  /**
   * Verify a transaction by reference
   */
  async verifyTransaction(reference: string): Promise<PaystackTransaction> {
    try {
      const response = await this.client.get<VerifyTransactionResponse>(`/transaction/verify/${reference}`);

      if (!response.data.status) {
        throw new ApiError(400, `Transaction verification failed: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Transaction verification failed: ${error.message}`);
    }
  }

  /**
   * Get transaction details by reference
   */
  async getTransaction(reference: string): Promise<PaystackTransaction> {
    try {
      const response = await this.client.get<VerifyTransactionResponse>(`/transaction/verify/${reference}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Create a refund for a transaction
   */
  async createRefund(
    transactionReference: string,
    amount?: number, // Amount in dollars
    reason?: string,
  ): Promise<{
    refundId: string;
    amount: number;
    status: string;
  }> {
    try {
      const refundAmount = amount ? Math.round(amount * 100) : undefined; // Convert to kobo

      const response = await this.client.post<CreateRefundResponse>('/refund', {
        transaction: transactionReference,
        amount: refundAmount,
        reason: reason || 'Refund requested',
      });

      if (!response.data.status) {
        throw new ApiError(400, `Refund creation failed: ${response.data.message}`);
      }

      return {
        refundId: response.data.data.id.toString(),
        amount: response.data.data.amount / 100,
        status: response.data.data.status,
      };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Refund creation failed: ${error.message}`);
    }
  }

  /**
   * List transactions with filters
   */
  async listTransactions(filters?: {
    status?: string;
    from?: string;
    to?: string;
    perPage?: number;
    page?: number;
  }): Promise<{
    transactions: PaystackTransaction[];
    total: number;
    page: number;
    perPage: number;
  }> {
    try {
      const params: Record<string, any> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.from) params.from = filters.from;
      if (filters?.to) params.to = filters.to;
      if (filters?.perPage) params.perPage = filters.perPage;
      if (filters?.page) params.page = filters.page;

      const response = await this.client.get('/transaction', { params });

      return {
        transactions: response.data.data,
        total: response.data.meta?.total || 0,
        page: response.data.meta?.page || 1,
        perPage: response.data.meta?.perPage || 10,
      };
    } catch (error: any) {
      throw new ApiError(500, `Failed to list transactions: ${error.message}`);
    }
  }

  /**
   * Charge authorization (for recurring payments)
   */
  async chargeAuthorization(
    authorizationCode: string,
    amount: number,
    email: string,
    reference: string,
  ): Promise<PaystackTransaction> {
    try {
      const response = await this.client.post<VerifyTransactionResponse>('/transaction/charge_authorization', {
        authorization_code: authorizationCode,
        amount: Math.round(amount * 100),
        email,
        reference,
      });

      if (!response.data.status) {
        throw new ApiError(400, `Charge failed: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Charge authorization failed: ${error.message}`);
    }
  }

  /**
   * Check if transaction was successful
   */
  isTransactionSuccessful(transaction: PaystackTransaction): boolean {
    return transaction.status === 'success';
  }
}

export const paystackService = new PaystackService();
export default paystackService;

