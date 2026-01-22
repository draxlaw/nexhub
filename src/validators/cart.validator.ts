const { body, param } = require('express-validator');

/**
 * Validator for adding item to cart
 */
export const addItem = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
];

/**
 * Validator for updating cart item
 */
export const updateItem = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Quantity must be between 0 and 100'),
];

/**
 * Validator for removing item from cart
 */
export const removeItem = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

/**
 * Validator for applying coupon
 */
export const applyCoupon = [
  body('couponCode')
    .notEmpty()
    .withMessage('Coupon code is required')
    .isString()
    .withMessage('Coupon code must be a string')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Coupon code must be between 3 and 50 characters'),
];
