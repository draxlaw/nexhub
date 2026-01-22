import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { aiConfig } from '../../config/ai';
import { intentClassifier } from './intentClassifier';
import { responseGenerator } from './responseGenerator';
import Product from '../../models/Product.model';
import Order from '../../models/Order.model';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: aiConfig.openai.apiKey,
});

// Types for chatbot
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  userId?: string;
  messages: ChatMessage[];
  context: {
    lastProductsViewed: string[];
    lastCategoryViewed: string[];
    currentIntent?: string;
  };
  createdAt: Date;
  lastActivity: Date;
}

// In-memory session storage (use Redis in production)
const sessions = new Map<string, ChatSession>();

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful shopping assistant for Nexus Hub e-commerce platform.

Your capabilities include:
1. Helping customers find products
2. Answering questions about orders
3. Providing product recommendations
4. Assisting with returns and refunds
5. General shopping guidance

Guidelines:
- Be friendly, helpful, and professional
- Provide accurate product information when available
- If you don't know something, say so honestly
- Suggest related products when appropriate
- Keep responses concise but informative
- Always ask clarifying questions if the request is ambiguous

Current context about the store:
- Nexus Hub offers a wide variety of products across multiple categories
- All products have ratings and reviews
- Free shipping on orders over $50
- 30-day return policy
- Multiple payment options available`;

// Create or get a chat session
export function getSession(sessionId?: string): ChatSession {
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    session.lastActivity = new Date();
    return session;
  }

  const newSession: ChatSession = {
    sessionId: sessionId || uuidv4(),
    messages: [],
    context: {
      lastProductsViewed: [],
      lastCategoryViewed: [],
    },
    createdAt: new Date(),
    lastActivity: new Date(),
  };

  sessions.set(newSession.sessionId, newSession);
  return newSession;
}

// Save session to storage
function saveSession(session: ChatSession): void {
  sessions.set(session.sessionId, session);
}

// Clean up old sessions
function cleanupOldSessions(): void {
  const timeout = aiConfig.chatbot.sessionTimeoutMinutes * 60 * 1000;
  const now = Date.now();

  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity.getTime() > timeout) {
      sessions.delete(sessionId);
    }
  }
}

// Set up periodic cleanup
setInterval(cleanupOldSessions, 5 * 60 * 1000); // Every 5 minutes

// Main chatbot engine
export async function processMessage(
  message: string,
  sessionId?: string,
  userId?: string
): Promise<{ response: string; sessionId: string; intent?: string }> {
  const session = getSession(sessionId);

  if (sessionId && userId) {
    session.userId = userId;
  }

  // Add user message to session
  session.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
  });

  // Classify intent
  const intent = await intentClassifier.classify(message);
  session.context.currentIntent = intent;

  // Build context for OpenAI
  const systemMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT, timestamp: new Date() },
  ];

  // Add recent conversation context (last N messages)
  const recentMessages = session.messages.slice(-aiConfig.chatbot.maxContextMessages * 2);

  // Get relevant products for context
  let productContext = '';
  if (['product_search', 'product_details', 'recommendation'].includes(intent)) {
    const products: any[] = await searchProductsForIntent(message, intent);
    if (products.length > 0) {
      productContext = `\n\nRelevant products found:\n${products.map(p =>
        `- ${p.name}: $${p.finalPrice} (Rating: ${p.rating}/5, ${p.totalReviews} reviews)`
      ).join('\n')}`;
    }
  }

  // Add product context to system prompt if available
  if (productContext) {
    systemMessages[0].content += productContext;
  }

  // Build the conversation
  const conversationMessages = [
    ...systemMessages,
    ...recentMessages.map(m => ({ role: m.role, content: m.content })),
  ];

  let response: string;

  try {
    if (aiConfig.openai.apiKey) {
      // Use OpenAI for intelligent responses
      const completion = await openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: conversationMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        max_tokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature,
      });

      response = completion.choices[0]?.message?.content ||
        'I apologize, but I encountered an issue. Please try again.';
    } else {
      // Fall back to rule-based responses
      response = await responseGenerator.generate(message, intent, session.context);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fall back to rule-based responses on error
    response = await responseGenerator.generate(message, intent, session.context);
  }

  // Add assistant response to session
  session.messages.push({
    role: 'assistant',
    content: response,
    timestamp: new Date(),
  });

  // Save session
  saveSession(session);

  return { response, sessionId: session.sessionId, intent };
}

// Search products based on intent
async function searchProductsForIntent(query: string, intent: string): Promise<any[]> {
  try {
    let products: any[] = [];

    switch (intent) {
      case 'product_search':
        products = await Product.find({
          $text: { $search: query },
          isActive: true,
          status: 'published',
        })
          .select('name finalPrice rating totalReviews images')
          .limit(5);
        break;

      case 'product_details':
        const nameMatch = await Product.findOne({
          name: { $regex: query, $options: 'i' },
          isActive: true,
        })
          .select('name finalPrice rating totalReviews description images stock')
          .limit(1);
        products = nameMatch ? [nameMatch] : [];
        break;

      default:
        products = [];
    }

    return products;
  } catch (error) {
    console.error('Product search error:', error);
    return [];
  }
}

// Get order information for a user
export async function getOrderInfo(orderId: string, userId?: string): Promise<any> {
  try {
    const query: any = { orderId };
    if (userId) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('items.product', 'name images finalPrice')
      .populate('shippingAddress', 'city state country');

    return order;
  } catch (error) {
    console.error('Order lookup error:', error);
    return null;
  }
}

// Update session context
export function updateSessionContext(
  sessionId: string,
  updates: Partial<ChatSession['context']>
): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.context = { ...session.context, ...updates };
    session.lastActivity = new Date();
    saveSession(session);
  }
}

// Delete a session
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

// Get conversation history for a session
export function getConversationHistory(sessionId: string): ChatMessage[] {
  const session = sessions.get(sessionId);
  return session?.messages || [];
}

export const chatbotEngine = {
  processMessage,
  getSession,
  getOrderInfo,
  updateSessionContext,
  deleteSession,
  getConversationHistory,
};

export default chatbotEngine;
