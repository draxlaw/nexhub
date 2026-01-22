const { body } = require('express-validator');

export const createOrder = [
  body('shippingAddress')
    .notEmpty()
    .withMessage('Shipping address is required')
    .isMongoId()
    .withMessage('Invalid shipping address ID'),
  body('billingAddress')
    .optional()
    .isMongoId()
    .withMessage('Invalid billing address ID'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isString()
    .withMessage('Payment method must be a string'),
  body('paymentProvider')
    .optional()
    .isIn(['stripe', 'paystack', 'cod'])
    .withMessage('Invalid payment provider'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  body('couponCode')
    .optional()
    .isString()
    .withMessage('Coupon code must be a string')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters'),
];

export const updateOrderStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ])
    .withMessage('Invalid status'),
  body('trackingNumber')
    .optional()
    .isString()
    .withMessage('Tracking number must be a string'),
];
