import api from './api';

// Types for admin dashboard
export interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  pendingVendors: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  salesChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'vendor' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AdminProduct {
  _id: string;
  name: string;
  price: number;
  vendor: {
    _id: string;
    businessName: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'published';
  isActive: boolean;
  stock: number;
  createdAt: string;
}

export interface AdminVendor {
  _id: string;
  businessName: string;
  businessEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  totalProducts: number;
  totalSales: number;
  rating: number;
  createdAt: string;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export const adminService = {
  // ============ DASHBOARD ============
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // ============ USER MANAGEMENT ============
  async getAllUsers(page: number = 1, limit: number = 10, search?: string, role?: string): Promise<{
    users: User[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  async getUserById(userId: string): Promise<User & { addressCount: number; orderCount: number }> {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  async updateUserRole(userId: string, role: 'user' | 'vendor' | 'admin'): Promise<User> {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async verifyUserEmail(userId: string): Promise<User> {
    const response = await api.patch(`/admin/users/${userId}/verify-email`);
    return response.data;
  },

  async deactivateUser(userId: string): Promise<User> {
    const response = await api.patch(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  async activateUser(userId: string): Promise<User> {
    const response = await api.patch(`/admin/users/${userId}/activate`);
    return response.data;
  },

  // ============ PRODUCT MANAGEMENT ============
  async getAllProducts(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<{
    products: AdminProduct[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await api.get(`/admin/products?${params}`);
    return response.data;
  },

  async approveProduct(productId: string): Promise<AdminProduct> {
    const response = await api.patch(`/admin/products/${productId}/approve`);
    return response.data;
  },

  async rejectProduct(productId: string, reason?: string): Promise<AdminProduct> {
    const response = await api.patch(`/admin/products/${productId}/reject`, { reason });
    return response.data;
  },

  async toggleProductStatus(productId: string): Promise<AdminProduct> {
    const response = await api.patch(`/admin/products/${productId}/toggle-status`);
    return response.data;
  },

  async deleteProduct(productId: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/products/${productId}`);
    return response.data;
  },

  // ============ VENDOR MANAGEMENT ============
  async getPendingVendors(): Promise<AdminVendor[]> {
    const response = await api.get('/admin/vendors/pending');
    return response.data;
  },

  async getAllVendors(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<{
    vendors: AdminVendor[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await api.get(`/admin/vendors?${params}`);
    return response.data;
  },

  async approveVendor(vendorId: string): Promise<AdminVendor> {
    const response = await api.patch(`/admin/vendors/${vendorId}/approve`);
    return response.data;
  },

  async rejectVendor(vendorId: string, reason: string): Promise<AdminVendor> {
    const response = await api.patch(`/admin/vendors/${vendorId}/reject`, { reason });
    return response.data;
  },

  async activateVendor(vendorId: string): Promise<AdminVendor> {
    const response = await api.patch(`/admin/vendors/${vendorId}/activate`);
    return response.data;
  },

  async deactivateVendor(vendorId: string): Promise<AdminVendor> {
    const response = await api.patch(`/admin/vendors/${vendorId}/deactivate`);
    return response.data;
  },

  async toggleVendorStatus(vendorId: string): Promise<AdminVendor> {
    const response = await api.patch(`/admin/vendors/${vendorId}/toggle-status`);
    return response.data;
  },

  // ============ CATEGORY MANAGEMENT ============
  async getAllCategories(): Promise<any[]> {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  async toggleCategoryStatus(categoryId: string): Promise<any> {
    const response = await api.patch(`/admin/categories/${categoryId}/toggle-status`);
    return response.data;
  },

  // ============ REPORTS & ANALYTICS ============
  async getVendorPerformance(startDate?: string, endDate?: string): Promise<{
    vendors: Array<{
      _id: string;
      businessName: string;
      totalSales: number;
      totalOrders: number;
      averageOrderValue: number;
    }>;
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/admin/reports/vendor-performance?${params}`);
    return response.data;
  },

  async getTopProducts(limit: number = 10, startDate?: string, endDate?: string): Promise<{
    products: Array<{
      _id: string;
      name: string;
      totalSold: number;
      revenue: number;
    }>;
  }> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/admin/reports/top-products?${params}`);
    return response.data;
  },

  // ============ ORDER MANAGEMENT ============
  async getAllOrders(page: number = 1, limit: number = 10, status?: string, search?: string): Promise<{
    orders: AdminOrder[];
    total: number;
    pages: number;
  }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const response = await api.get(`/admin/orders?${params}`);
    return response.data;
  },

  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  }> {
    const response = await api.get('/admin/orders/stats');
    return response.data;
  },

  async getOrderById(orderId: string): Promise<any> {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  async updateOrderStatusAdmin(orderId: string, status: string, note?: string): Promise<any> {
    const response = await api.patch(`/admin/orders/${orderId}/status`, { status, note });
    return response.data;
  },

  async processOrderRefund(orderId: string, amount?: number, reason?: string): Promise<any> {
    const response = await api.post(`/admin/orders/${orderId}/refund`, { amount, reason });
    return response.data;
  },

  // ============ SYSTEM SETTINGS ============
  async getSystemSettings(): Promise<any> {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  async updateSystemSettings(settings: Record<string, any>): Promise<any> {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },
};

export default adminService;

