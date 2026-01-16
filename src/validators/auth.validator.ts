const { body } = require('express-validator');

export const register = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().isString(),
];

export const login = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password is required'),
];
