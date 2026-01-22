import { Request, Response, NextFunction } from 'express';
import chatbotService from '../services/chatbot.service';

/**
 * Process a chat message
 * POST /api/chatbot/message
 */
export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, sessionId } = req.body;
    const user = (req as any).user;
    const userId = user?.id;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const result = await chatbotService.processMessage({
      message,
      sessionId,
      userId,
    });

    res.json({ success: true, data: result, message: 'Message processed successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get chat session info
 * GET /api/chatbot/session/:sessionId
 */
export async function getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required' });
      return;
    }

    const session = chatbotService.getSession(sessionId);

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    res.json({ success: true, data: session, message: 'Session retrieved successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get conversation history
 * GET /api/chatbot/history/:sessionId
 */
export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required' });
      return;
    }

    const history = chatbotService.getConversationHistory(sessionId);

    res.json({ success: true, data: { messages: history }, message: 'History retrieved successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Update session context (e.g., when viewing a product)
 * PUT /api/chatbot/session/:sessionId/context
 */
export async function updateContext(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
    const { lastProductsViewed, lastCategoryViewed, currentIntent } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required' });
      return;
    }

    chatbotService.updateSessionContext(sessionId, {
      lastProductsViewed,
      lastCategoryViewed,
      currentIntent,
    });

    res.json({ success: true, message: 'Context updated successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a chat session
 * DELETE /api/chatbot/session/:sessionId
 */
export async function deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;

    if (!sessionId) {
      res.status(400).json({ success: false, message: 'Session ID is required' });
      return;
    }

    const deleted = chatbotService.deleteSession(sessionId);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Search products (for chatbot integration)
 * GET /api/chatbot/products/search
 */
export async function searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q, limit } = req.query;

    if (!q) {
      res.status(400).json({ success: false, message: 'Search query is required' });
      return;
    }

    const products = await chatbotService.searchProducts(
      q as string,
      limit ? parseInt(limit as string) : 5
    );

    res.json({ success: true, data: { products }, message: 'Products retrieved successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get product details
 * GET /api/chatbot/products/:productId
 */
export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }

    const product = await chatbotService.getProductById(productId);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({ success: true, data: { product }, message: 'Product retrieved successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user's recent orders
 * GET /api/chatbot/orders
 */
export async function getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const userId = user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const orders = await chatbotService.getUserRecentOrders(userId);

    res.json({ success: true, data: { orders }, message: 'Orders retrieved successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Track product view
 * POST /api/chatbot/track/product/:sessionId/:productId
 */
export async function trackProductView(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

    if (!sessionId || !productId) {
      res.status(400).json({ success: false, message: 'Session ID and Product ID are required' });
      return;
    }

    await chatbotService.trackProductView(sessionId, productId);

    res.json({ success: true, message: 'Product view tracked successfully' });
  } catch (err) {
    next(err);
  }
}
