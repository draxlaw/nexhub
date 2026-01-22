import api from './api';

// Types for image search
export interface ImageSearchResult {
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
  similarity?: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
}

export interface ImageSearchSession {
  _id: string;
  sessionId: string;
  originalImage: string;
  results: ImageSearchResult[];
  totalResults: number;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface UploadImageData {
  image: File;
  options?: {
    maxResults?: number;
    minSimilarity?: number;
    categoryFilter?: string;
    colorFilter?: string;
  };
}

export const imageSearchService = {
  // Upload image and start search
  async uploadImage(data: UploadImageData): Promise<ImageSearchSession> {
    const formData = new FormData();
    formData.append('image', data.image);
    if (data.options) {
      if (data.options.maxResults) formData.append('maxResults', data.options.maxResults.toString());
      if (data.options.minSimilarity) formData.append('minSimilarity', data.options.minSimilarity.toString());
      if (data.options.categoryFilter) formData.append('categoryFilter', data.options.categoryFilter);
      if (data.options.colorFilter) formData.append('colorFilter', data.options.colorFilter);
    }

    const response = await api.post('/image-search/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get search results by session ID
  async getResults(sessionId: string): Promise<ImageSearchSession> {
    const response = await api.get(`/image-search/results/${sessionId}`);
    return response.data;
  },

  // Check search status
  async getStatus(sessionId: string): Promise<{
    sessionId: string;
    status: 'processing' | 'completed' | 'failed';
    progress?: number;
  }> {
    const response = await api.get(`/image-search/status/${sessionId}`);
    return response.data;
  },

  // Get similar products directly (without creating session)
  async findSimilarProducts(
    productId: string,
    limit: number = 10
  ): Promise<{
    products: ImageSearchResult[];
    total: number;
  }> {
    const response = await api.get(`/image-search/similar/${productId}?limit=${limit}`);
    return response.data;
  },

  // Get products by color
  async searchByColor(
    color: string,
    limit: number = 12
  ): Promise<{
    products: ImageSearchResult[];
    total: number;
  }> {
    const response = await api.get(`/image-search/color/${color}?limit=${limit}`);
    return response.data;
  },

  // Get trending/similar products based on browsing history
  async getVisualRecommendations(limit: number = 12): Promise<{
    products: ImageSearchResult[];
    reason: string;
  }> {
    const response = await api.get(`/image-search/recommendations?limit=${limit}`);
    return response.data;
  },

  // Get search history
  async getSearchHistory(): Promise<Array<{
    sessionId: string;
    originalImage: string;
    resultCount: number;
    createdAt: string;
  }>> {
    const response = await api.get('/image-search/history');
    return response.data;
  },

  // Delete search history
  async deleteSearchHistory(): Promise<{ message: string }> {
    const response = await api.delete('/image-search/history');
    return response.data;
  },

  // Delete single search session
  async deleteSearchSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete(`/image-search/session/${sessionId}`);
    return response.data;
  },

  // Get available color filters
  async getAvailableColors(): Promise<string[]> {
    const response = await api.get('/image-search/colors');
    return response.data;
  },

  // Get category tags from image (AI analysis)
  async analyzeImage(imageFile: File): Promise<{
    tags: Array<{ label: string; confidence: number }>;
    colors: Array<{ name: string; hex: string; percentage: number }>;
    categories: Array<{ name: string; confidence: number }>;
  }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/image-search/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Rate search results
  async rateResults(
    sessionId: string,
    ratings: Array<{ productId: string; helpful: boolean }>
  ): Promise<{ message: string }> {
    const response = await api.post(`/image-search/rate/${sessionId}`, { ratings });
    return response.data;
  },
};

export default imageSearchService;

