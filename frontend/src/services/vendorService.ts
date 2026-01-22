import api from './api';

// Types based on backend Vendor model
export interface Vendor {
  _id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  logo?: string;
  banner?: string;
  description?: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'suspended';
  rating: number;
  totalReviews: number;
  totalProducts: number;
  totalSales: number;
  commissionRate: number;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  documents?: Array<{
    type: string;
    url: string;
    verified: boolean;
  }>;
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VendorStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalEarnings: number;
  pendingPayout: number;
  averageRating: number;
  totalReviews: number;
}

export interface RegisterVendorData {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  description?: string;
  category: string;
}

export interface UpdateVendorData extends Partial<RegisterVendorData> {
  logo?: string;
  banner?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  socialLinks?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export const vendorService = {
  // Get all vendors (public)
  async getAllVendors(page: number = 1, limit: number = 10): Promise<{ vendors: Vendor[]; total: number }> {
    const response = await api.get(`/vendors?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get vendor by ID (public)
  async getVendor(vendorId: string): Promise<Vendor> {
    const response = await api.get(`/vendors/${vendorId}`);
    return response.data;
  },

  // Get vendor by slug (public)
  async getVendorBySlug(slug: string): Promise<Vendor> {
    const response = await api.get(`/vendors/slug/${slug}`);
    return response.data;
  },

  // Register as vendor
  async registerVendor(data: RegisterVendorData): Promise<Vendor> {
    const response = await api.post('/vendors/register', data);
    return response.data;
  },

  // Get current vendor profile
  async getVendorProfile(): Promise<Vendor> {
    const response = await api.get('/vendors/me');
    return response.data;
  },

  // Update vendor profile
  async updateVendorProfile(data: UpdateVendorData): Promise<Vendor> {
    const response = await api.put('/vendors/me', data);
    return response.data;
  },

  // Get vendor stats
  async getVendorStats(): Promise<VendorStats> {
    const response = await api.get('/vendors/me/stats');
    return response.data;
  },

  // Get vendor products
  async getVendorProducts(page: number = 1, limit: number = 10, status?: string): Promise<{
    products: any[];
    total: number;
  }> {
    const response = await api.get(`/vendors/me/products?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`);
    return response.data;
  },

  // Get vendor orders
  async getVendorOrders(page: number = 1, limit: number = 10, status?: string): Promise<{
    orders: any[];
    total: number;
  }> {
    const response = await api.get(`/vendors/me/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`);
    return response.data;
  },

  // Get vendor earnings
  async getVendorEarnings(startDate?: string, endDate?: string): Promise<{
    totalEarnings: number;
    pendingPayout: number;
    completedPayouts: number;
    transactions: Array<{
      type: 'order' | 'payout' | 'refund';
      amount: number;
      status: string;
      date: string;
      description: string;
    }>;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/vendors/me/earnings?${params}`);
    return response.data;
  },

  // Approve vendor (admin only)
  async approveVendor(vendorId: string): Promise<Vendor> {
    const response = await api.patch(`/vendors/${vendorId}/approve`);
    return response.data;
  },

  // Reject vendor (admin only)
  async rejectVendor(vendorId: string, reason: string): Promise<Vendor> {
    const response = await api.patch(`/vendors/${vendorId}/reject`, { reason });
    return response.data;
  },

  // Deactivate vendor (admin only)
  async deactivateVendor(vendorId: string): Promise<Vendor> {
    const response = await api.patch(`/vendors/${vendorId}/deactivate`);
    return response.data;
  },

  // Upload vendor documents
  async uploadDocuments(files: File[]): Promise<{ documents: Array<{ type: string; url: string }> }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('documents', file));
    const response = await api.post('/vendors/me/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get pending vendors (admin only)
  async getPendingVendors(): Promise<Vendor[]> {
    const response = await api.get('/vendors/pending');
    return response.data;
  },
};

export default vendorService;

