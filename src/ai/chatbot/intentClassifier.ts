export class IntentClassifier {
  private intents = [
    'product_search',
    'product_details',
    'recommendation',
    'order_status',
    'return_refund',
    'general_help',
    'greeting',
    'goodbye'
  ];

  async classify(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // Simple rule-based classification
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking for')) {
      return 'product_search';
    }
    if (lowerMessage.includes('details') || lowerMessage.includes('info') || lowerMessage.includes('about')) {
      return 'product_details';
    }
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return 'recommendation';
    }
    if (lowerMessage.includes('order') || lowerMessage.includes('status') || lowerMessage.includes('tracking')) {
      return 'order_status';
    }
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
      return 'return_refund';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
      return 'general_help';
    }
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return 'goodbye';
    }

    return 'general_help'; // default
  }
}

export const intentClassifier = new IntentClassifier();
