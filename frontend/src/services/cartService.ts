import api from './api';
import { CartItem } from '../types';

export const cartService = {
  // Get current user's cart
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  // Get cart summary for checkout
  async getCartSummary() {
    const response = await api.get('/cart/summary');
    return response.data;
  },

  // Validate cart (check stock, prices, availability)
  async validateCart() {
    const response = await api.get('/cart/validate');
    return response.data;
  },

  // Add item to cart
  async addItem(productId: string, quantity: number, variant?: { size?: string; color?: string }) {
    const response = await api.post('/cart/items', { productId, quantity, variant });
    return response.data;
  },

  // Update cart item quantity
  async updateItem(productId: string, quantity: number) {
    const response = await api.put(`/cart/items/${productId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  async removeItem(productId: string) {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },

  // Clear all items from cart
  async clearCart() {
    const response = await api.delete('/cart');
    return response.data;
  },

  // Apply coupon to cart
  async applyCoupon(code: string) {
    const response = await api.post('/cart/coupon', { code });
    return response.data;
  },

  // Remove coupon from cart
  async removeCoupon() {
    const response = await api.delete('/cart/coupon');
    return response.data;
  },

  // Sync cart prices with current product prices
  async syncPrices() {
    const response = await api.post('/cart/sync');
    return response.data;
  },
};
