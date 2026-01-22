import api from './api';

// Types based on backend User model
export interface UserProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'vendor' | 'admin';
  isVerified: boolean;
  provider?: 'local' | 'google' | 'facebook';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  userId: string;
  label: 'home' | 'work' | 'other';
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  label: 'home' | 'work' | 'other';
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export const userService = {
  // Get current user profile
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ============ ADDRESS MANAGEMENT ============
  async getAddresses(): Promise<Address[]> {
    const response = await api.get('/users/addresses');
    return response.data;
  },

  async getAddress(addressId: string): Promise<Address> {
    const response = await api.get(`/users/addresses/${addressId}`);
    return response.data;
  },

  async createAddress(data: CreateAddressData): Promise<Address> {
    const response = await api.post('/users/addresses', data);
    return response.data;
  },

  async updateAddress(addressId: string, data: UpdateAddressData): Promise<Address> {
    const response = await api.put(`/users/addresses/${addressId}`, data);
    return response.data;
  },

  async deleteAddress(addressId: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
  },

  async setDefaultAddress(addressId: string): Promise<Address> {
    const response = await api.patch(`/users/addresses/${addressId}/default`);
    return response.data;
  },

  // ============ PREFERENCES ============
  async getPreferences(): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
    language: string;
    currency: string;
  }> {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  async updatePreferences(preferences: Record<string, any>): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    newsletter: boolean;
    language: string;
    currency: string;
  }> {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  // ============ NOTIFICATIONS ============
  async getNotifications(page: number = 1, limit: number = 10): Promise<{
    notifications: Array<{
      _id: string;
      type: string;
      title: string;
      message: string;
      isRead: boolean;
      createdAt: string;
    }>;
    total: number;
    unreadCount: number;
  }> {
    const response = await api.get(`/users/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  async markNotificationRead(notificationId: string): Promise<{ message: string }> {
    const response = await api.patch(`/users/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const response = await api.patch('/users/notifications/read-all');
    return response.data;
  },

  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/notifications/${notificationId}`);
    return response.data;
  },

  // ============ ACCOUNT MANAGEMENT ============
  async deleteAccount(password: string): Promise<{ message: string }> {
    const response = await api.post('/users/delete', { password });
    return response.data;
  },

  async exportData(): Promise<{ downloadUrl: string }> {
    const response = await api.post('/users/export');
    return response.data;
  },

  // ============ REFERALS ============
  async getReferralCode(): Promise<{ code: string; count: number; rewards: number }> {
    const response = await api.get('/users/referral');
    return response.data;
  },

  async applyReferralCode(code: string): Promise<{ message: string; discount: number }> {
    const response = await api.post('/users/referral/apply', { code });
    return response.data;
  },
};

export default userService;

