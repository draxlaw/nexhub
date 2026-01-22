import api from './api';

// Types based on backend Chatbot model
export interface ChatMessage {
  _id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  entities?: Array<{ type: string; value: string }>;
  suggestions?: string[];
  createdAt: string;
}

export interface ChatSession {
  _id: string;
  sessionId: string;
  userId?: string;
  context: {
    viewedProducts: string[];
    cartItems: number;
    recentSearches: string[];
    preferredCategories: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

export interface SendMessageData {
  message: string;
  sessionId?: string;
  context?: {
    currentProduct?: string;
    currentCategory?: string;
  };
}

export interface SendMessageResponse {
  sessionId: string;
  message: ChatMessage;
  suggestions?: string[];
  quickActions?: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
}

export interface ProductSearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: {
    name: string;
  };
  rating: number;
}

export const chatbotService = {
  // Send a message to the chatbot
  async sendMessage(data: SendMessageData): Promise<SendMessageResponse> {
    const response = await api.post('/chatbot/message', data);
    return response.data;
  },

  // Get chat session info
  async getSession(sessionId: string): Promise<ChatSession> {
    const response = await api.get(`/chatbot/session/${sessionId}`);
    return response.data;
  },

  // Get conversation history
  async getHistory(sessionId: string, limit: number = 50): Promise<{
    messages: ChatMessage[];
    total: number;
  }> {
    const response = await api.get(`/chatbot/history/${sessionId}?limit=${limit}`);
    return response.data;
  },

  // Update session context
  async updateContext(
    sessionId: string,
    context: Partial<ChatSession['context']>
  ): Promise<ChatSession> {
    const response = await api.put(`/chatbot/session/${sessionId}/context`, context);
    return response.data;
  },

  // Delete a chat session
  async deleteSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete(`/chatbot/session/${sessionId}`);
    return response.data;
  },

  // Clear all sessions for user
  async clearAllSessions(): Promise<{ message: string }> {
    const response = await api.delete('/chatbot/sessions');
    return response.data;
  },

  // Search products via chatbot
  async searchProducts(
    query: string,
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      rating?: number;
    }
  ): Promise<{
    products: ProductSearchResult[];
    total: number;
    suggestions?: string[];
  }> {
    const params = new URLSearchParams({ query });
    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.rating) params.append('rating', filters.rating.toString());
    }
    const response = await api.get(`/chatbot/products/search?${params}`);
    return response.data;
  },

  // Get product details via chatbot
  async getProduct(productId: string): Promise<{
    product: ProductSearchResult;
    description: string;
    inStock: boolean;
    alternatives?: ProductSearchResult[];
  }> {
    const response = await api.get(`/chatbot/products/${productId}`);
    return response.data;
  },

  // Track product view in session
  async trackProductView(sessionId: string, productId: string): Promise<{ success: boolean }> {
    const response = await api.post(`/chatbot/track/product/${sessionId}/${productId}`);
    return response.data;
  },

  // Get user's recent orders (for chatbot context)
  async getUserOrders(limit: number = 5): Promise<{
    orders: Array<{
      _id: string;
      orderNumber: string;
      total: number;
      status: string;
      createdAt: string;
    }>;
  }> {
    const response = await api.get(`/chatbot/orders?limit=${limit}`);
    return response.data;
  },

  // Get recommended products
  async getRecommendations(type: 'trending' | 'new' | 'personalized' = 'personalized'): Promise<{
    products: ProductSearchResult[];
    reason: string;
  }> {
    const response = await api.get(`/chatbot/recommendations?type=${type}`);
    return response.data;
  },

  // Get FAQ suggestions
  async getFAQCategories(): Promise<Array<{
    category: string;
    questions: Array<{ question: string; answer: string }>;
  }>> {
    const response = await api.get('/chatbot/faqs');
    return response.data;
  },

  // Start a new session
  async startSession(): Promise<{ sessionId: string }> {
    const response = await api.post('/chatbot/session');
    return response.data;
  },

  // Get all user sessions
  async getAllSessions(): Promise<ChatSession[]> {
    const response = await api.get('/chatbot/sessions');
    return response.data;
  },
};

export default chatbotService;

