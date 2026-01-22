import api from './api';
import { ProductFilters, CreateProductData, UpdateProductData } from '../types';

export const productService = {
  // Get all products with filters
  async getProducts(filters?: ProductFilters) {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/products?${params}`);
    return response.data;
  },

  // Get single product
  async getProduct(productId: string) {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  // Create product (vendor only)
  async createProduct(productData: CreateProductData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (vendor only)
  async updateProduct(productId: string, productData: UpdateProductData) {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  // Delete product (vendor only)
  async deleteProduct(productId: string) {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  // Get vendor's products
  async getMyProducts() {
    const response = await api.get('/products/vendor/my-products');
    return response.data;
  },

  // Get vendor stats
  async getVendorStats() {
    const response = await api.get('/products/vendor/stats');
    return response.data;
  },

  // Publish/unpublish product
  async togglePublish(productId: string) {
    const response = await api.patch(`/products/${productId}/publish`);
    return response.data;
  },
};
