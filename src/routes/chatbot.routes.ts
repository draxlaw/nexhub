import { Router } from 'express';
import * as chatbotController from '../controllers/chatbot.controller';

const router = Router();

/**
 * @route POST /api/chatbot/message
 * @desc Process a chat message and get AI response
 * @access Public (or Private if user context needed)
 */
router.post(
  '/message',
  chatbotController.sendMessage
);

/**
 * @route GET /api/chatbot/session/:sessionId
 * @desc Get chat session info
 * @access Public
 */
router.get(
  '/session/:sessionId',
  chatbotController.getSession
);

/**
 * @route GET /api/chatbot/history/:sessionId
 * @desc Get conversation history for a session
 * @access Public
 */
router.get(
  '/history/:sessionId',
  chatbotController.getHistory
);

/**
 * @route PUT /api/chatbot/session/:sessionId/context
 * @desc Update session context
 * @access Public
 */
router.put(
  '/session/:sessionId/context',
  chatbotController.updateContext
);

/**
 * @route DELETE /api/chatbot/session/:sessionId
 * @desc Delete a chat session
 * @access Public
 */
router.delete(
  '/session/:sessionId',
  chatbotController.deleteSession
);

/**
 * @route GET /api/chatbot/products/search
 * @desc Search products (for chatbot integration)
 * @access Public
 */
router.get(
  '/products/search',
  chatbotController.searchProducts
);

/**
 * @route GET /api/chatbot/products/:productId
 * @desc Get product details
 * @access Public
 */
router.get(
  '/products/:productId',
  chatbotController.getProduct
);

/**
 * @route GET /api/chatbot/orders
 * @desc Get user's recent orders (requires auth)
 * @access Private
 */
router.get(
  '/orders',
  chatbotController.getUserOrders
);

/**
 * @route POST /api/chatbot/track/product/:sessionId/:productId
 * @desc Track product view in session
 * @access Public
 */
router.post(
  '/track/product/:sessionId/:productId',
  chatbotController.trackProductView
);

export default router;
