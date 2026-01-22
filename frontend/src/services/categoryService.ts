import api from './api';

// Types based on backend Category model
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  productCount: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

export const categoryService = {
  // Get all categories (tree structure)
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get categories as flat list (for dropdowns)
  async getCategoriesList(): Promise<Category[]> {
    const response = await api.get('/categories?flat=true');
    return response.data;
  },

  // Get category by ID
  async getCategory(categoryId: string): Promise<Category> {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // Create category (admin only)
  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Update category (admin only)
  async updateCategory(categoryId: string, data: UpdateCategoryData): Promise<Category> {
    const response = await api.put(`/categories/${categoryId}`, data);
    return response.data;
  },

  // Delete category (admin only)
  async deleteCategory(categoryId: string): Promise<{ message: string }> {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  // Toggle category active status (admin only)
  async toggleCategoryStatus(categoryId: string): Promise<Category> {
    const response = await api.patch(`/categories/${categoryId}/toggle-status`);
    return response.data;
  },

  // Get category tree (nested structure)
  async getCategoryTree(): Promise<Category[]> {
    const response = await api.get('/categories?tree=true');
    return response.data;
  },

  // Get featured categories
  async getFeaturedCategories(limit: number = 6): Promise<Category[]> {
    const response = await api.get(`/categories/featured?limit=${limit}`);
    return response.data;
  },

  // Get category with products
  async getCategoryWithProducts(categoryId: string, page: number = 1, limit: number = 12): Promise<{
    category: Category;
    products: any[];
    total: number;
    pages: number;
  }> {
    const response = await api.get(`/categories/${categoryId}/products?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default categoryService;

