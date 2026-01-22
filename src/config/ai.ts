import dotenv from 'dotenv';
dotenv.config();

export const aiConfig = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  // Chatbot Configuration
  chatbot: {
    maxContextMessages: parseInt(process.env.CHATBOT_MAX_CONTEXT || '10'),
    sessionTimeoutMinutes: parseInt(process.env.CHATBOT_SESSION_TIMEOUT || '30'),
    defaultWelcomeMessage: process.env.CHATBOT_WELCOME_MSG || 'Hello! Welcome to Nexus Hub. How can I help you today?',
  },

  // Recommendation Configuration
  recommendation: {
    maxSimilarProducts: parseInt(process.env.MAX_SIMILAR_PRODUCTS || '10'),
    maxFrequentlyBought: parseInt(process.env.MAX_FREQUENTLY_BOUGHT || '5'),
    minScore: parseFloat(process.env.MIN_RECOMMENDATION_SCORE || '0.5'),
  },

  // Sentiment Analysis Configuration
  sentiment: {
    positiveThreshold: parseFloat(process.env.SENTIMENT_POSITIVE_THRESHOLD || '0.3'),
    negativeThreshold: parseFloat(process.env.SENTIMENT_NEGATIVE_THRESHOLD || '-0.3'),
  },

  // Vector Search Configuration
  vector: {
    dimension: parseInt(process.env.VECTOR_DIMENSION || '384'), // Sentence transformer dimension
    metric: process.env.VECTOR_METRIC || 'cosine',
    topK: parseInt(process.env.VECTOR_TOP_K || '10'),
  },
};

export default aiConfig;

