const { body } = require('express-validator');

export const register = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['customer', 'vendor']).withMessage('Role must be customer or vendor'),
];

export const login = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').exists().withMessage('Password is required'),
];
