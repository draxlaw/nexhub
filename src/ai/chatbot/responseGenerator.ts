export class ResponseGenerator {
  private responses = {
    greeting: [
      "Hello! I'm your shopping assistant. How can I help you find what you're looking for today?",
      "Hi there! Welcome to Nexus Hub. What can I assist you with?",
      "Greetings! I'm here to help you with your shopping needs. What are you interested in?"
    ],
    goodbye: [
      "Thank you for chatting with me! Have a great day!",
      "Goodbye! Feel free to come back anytime you need shopping assistance.",
      "Thanks for using Nexus Hub! See you next time."
    ],
    general_help: [
      "I'm here to help you with product searches, order information, recommendations, and general shopping questions. What would you like to know?",
      "I can assist you with finding products, checking order status, getting recommendations, and answering shopping-related questions. How can I help?",
      "Feel free to ask me about products, orders, returns, or any other shopping-related topics!"
    ],
    product_search: [
      "I'd be happy to help you find products! Could you tell me what you're looking for?",
      "Let me help you search for products. What type of item are you interested in?",
      "I can search our catalog for you. What product are you looking for?"
    ],
    product_details: [
      "I'd love to provide more details about a product. Which one are you interested in?",
      "I can give you detailed information about any product. What would you like to know more about?",
      "Let me help you learn more about a specific product. Which one catches your interest?"
    ],
    recommendation: [
      "I'd be glad to recommend some products! What type of items are you interested in?",
      "I can suggest products based on your preferences. What are you looking for?",
      "Let me recommend some great products. What category or type of item interests you?"
    ],
    order_status: [
      "I can help you check your order status. Do you have your order number?",
      "I'd be happy to look up your order information. What's your order ID?",
      "Let me check the status of your order. Could you provide your order number?"
    ],
    return_refund: [
      "For returns and refunds, we offer a 30-day return policy. Would you like me to explain the process?",
      "I can help you with return and refund information. What would you like to know?",
      "Our return policy allows returns within 30 days. How can I assist you with this?"
    ]
  };

  async generate(message: string, intent: string, context: any): Promise<string> {
    const intentResponses = this.responses[intent as keyof typeof this.responses] || this.responses.general_help;
    const randomResponse = intentResponses[Math.floor(Math.random() * intentResponses.length)];

    // Add context-specific information if available
    let enhancedResponse = randomResponse;

    if (context.lastProductsViewed && context.lastProductsViewed.length > 0) {
      enhancedResponse += " I noticed you've been looking at some products. Would you like recommendations based on those?";
    }

    return enhancedResponse;
  }
}

export const responseGenerator = new ResponseGenerator();
