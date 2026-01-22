const { body } = require('express-validator');

export const createPayment = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('paymentProvider')
    .notEmpty()
    .withMessage('Payment provider is required')
    .isIn(['stripe', 'paystack', 'cod'])
    .withMessage('Invalid payment provider'),
  body('callbackUrl')
    .optional()
    .isURL()
    .withMessage('Invalid callback URL'),
];

export const confirmPayment = [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('provider')
    .notEmpty()
    .withMessage('Provider is required')
    .isIn(['stripe', 'paystack'])
    .withMessage('Invalid provider'),
  body('transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
];

export const processRefund = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .isString()
    .withMessage('Reason must be a string')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('paymentProvider')
    .notEmpty()
    .withMessage('Payment provider is required')
    .isIn(['stripe', 'paystack'])
    .withMessage('Invalid payment provider for refund'),
];

export const getPaymentStatus = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID'),
];

