const { body } = require('express-validator');

export const createProduct = [
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category ID'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').notEmpty().withMessage('SKU is required').trim().toUpperCase(),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('discount').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0-100'),
  body('discountType').optional().isIn(['fixed', 'percentage']).withMessage('Invalid discount type'),
  body('images').optional().isArray().withMessage('Images must be an array'),
];

export const updateProduct = [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty').trim(),
  body('description').optional().notEmpty().withMessage('Description cannot be empty').trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isMongoId().withMessage('Invalid category ID'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').optional().notEmpty().withMessage('SKU cannot be empty').trim().toUpperCase(),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
];

export const filterProducts = [
  body('category').optional().isMongoId().withMessage('Invalid category ID'),
  body('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  body('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status'),
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be at least 1'),
  body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
];
