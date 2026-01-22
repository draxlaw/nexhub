import { chatbotEngine, ChatSession } from '../ai/chatbot/chatbotEngine';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import User from '../models/User.model';

interface ProcessMessageParams {
  message: string;
  sessionId?: string;
  userId?: string;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  intent?: string;
}

class ChatbotService {
  /**
   * Process a user message and return AI-generated response
   */
  async processMessage({ message, sessionId, userId }: ProcessMessageParams): Promise<ChatResponse> {
    try {
      const result = await chatbotEngine.processMessage(message, sessionId, userId);
      return result;
    } catch (error) {
      console.error('Chatbot service error:', error);
      throw error;
    }
  }

  /**
   * Get or create a chat session
   */
  getSession(sessionId?: string): ChatSession {
    return chatbotEngine.getSession(sessionId);
  }

  /**
   * Update session context (e.g., when user views a product)
   */
  updateSessionContext(sessionId: string, updates: {
    lastProductsViewed?: string[];
    lastCategoryViewed?: string[];
    currentIntent?: string;
  }): void {
    chatbotEngine.updateSessionContext(sessionId, updates);
  }

  /**
   * Delete a chat session
   */
  deleteSession(sessionId: string): boolean {
    return chatbotEngine.deleteSession(sessionId);
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId: string) {
    return chatbotEngine.getConversationHistory(sessionId);
  }

  /**
   * Get order information for a user (used by chatbot)
   */
  async getOrderInfo(orderId: string, userId?: string) {
    return chatbotEngine.getOrderInfo(orderId, userId);
  }

  /**
   * Search products for the chatbot
   */
  async searchProducts(query: string, limit: number = 5) {
    try {
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ],
        isActive: true,
        status: 'published',
      })
        .select('name finalPrice rating totalReviews images category stock')
        .limit(limit);

      return products;
    } catch (error) {
      console.error('Product search error:', error);
      return [];
    }
  }

  /**
   * Get product details by ID
   */
  async getProductById(productId: string) {
    try {
      const product = await Product.findById(productId)
        .populate('category', 'name')
        .populate('vendor', 'name storeName');

      return product;
    } catch (error) {
      console.error('Get product error:', error);
      return null;
    }
  }

  /**
   * Get user's recent orders (for order-related queries)
   */
  async getUserRecentOrders(userId: string, limit: number = 5) {
    try {
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('items.product', 'name images')
        .select('orderId status total createdAt');

      return orders;
    } catch (error) {
      console.error('Get orders error:', error);
      return [];
    }
  }

  /**
   * Track product view in session context
   */
  async trackProductView(sessionId: string, productId: string): Promise<void> {
    const session = this.getSession(sessionId);
    if (session) {
      const updatedProducts = [...session.context.lastProductsViewed, productId].slice(-10); // Keep last 10
      this.updateSessionContext(sessionId, { lastProductsViewed: updatedProducts });
    }
  }
}

export default new ChatbotService();

