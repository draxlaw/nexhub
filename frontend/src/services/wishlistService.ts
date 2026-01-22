import api from './api';

// Types based on backend Wishlist model
export interface WishlistItem {
  _id: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: string[];
    category: {
      _id: string;
      name: string;
      slug: string;
    };
    vendor: {
      _id: string;
      businessName: string;
    };
    rating: number;
    reviewCount: number;
    stock: number;
    isActive: boolean;
  };
  createdAt: string;
}

export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export const wishlistService = {
  // Get user's wishlist
  async getWishlist(): Promise<Wishlist> {
    const response = await api.get('/wishlist');
    return response.data;
  },

  // Get wishlist items count
  async getWishlistCount(): Promise<{ count: number }> {
    const response = await api.get('/wishlist/count');
    return response.data;
  },

  // Add item to wishlist
  async addItem(productId: string): Promise<WishlistItem> {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  // Add multiple items to wishlist
  async addMultipleItems(productIds: string[]): Promise<Wishlist> {
    const response = await api.post('/wishlist/bulk', { productIds });
    return response.data;
  },

  // Remove item from wishlist
  async removeItem(productId: string): Promise<{ message: string }> {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },

  // Check if product is in wishlist
  async isInWishlist(productId: string): Promise<{ isInWishlist: boolean; itemId?: string }> {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  },

  // Check multiple products
  async checkMultiple(productIds: string[]): Promise<{
    items: Array<{ productId: string; isInWishlist: boolean }>;
  }> {
    const response = await api.post('/wishlist/check-multiple', { productIds });
    return response.data;
  },

  // Move item to cart
  async moveToCart(productId: string, quantity: number = 1): Promise<{ message: string; cartItem: any }> {
    const response = await api.post(`/wishlist/${productId}/move-to-cart`, { quantity });
    return response.data;
  },

  // Move all items to cart
  async moveAllToCart(): Promise<{ message: string; movedCount: number }> {
    const response = await api.post('/wishlist/move-all-to-cart');
    return response.data;
  },

  // Clear wishlist
  async clearWishlist(): Promise<{ message: string }> {
    const response = await api.delete('/wishlist');
    return response.data;
  },

  // Get wishlist with pagination
  async getWishlistPaginated(page: number = 1, limit: number = 12): Promise<{
    items: WishlistItem[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    const response = await api.get(`/wishlist?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Sort wishlist
  async getWishlistSorted(sortBy: 'price-asc' | 'price-desc' | 'date' | 'name'): Promise<Wishlist> {
    const response = await api.get(`/wishlist/sorted?sortBy=${sortBy}`);
    return response.data;
  },
};

export default wishlistService;

