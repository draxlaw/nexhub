import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import * as productValidator from '../validators/product.validator';
import { protect } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

// Public routes
router.get('/', productController.listProducts);
router.get('/:productId', productController.getProduct);

// Protected routes - require authentication
router.post('/', protect, productValidator.createProduct, validateRequest, productController.createProduct);
router.put('/:productId', protect, productValidator.updateProduct, validateRequest, productController.updateProduct);
router.delete('/:productId', protect, productController.deleteProduct);
router.patch('/:productId/publish', protect, productController.publishProduct);

// Vendor routes
router.get('/vendor/my-products', protect, productController.myProducts);
router.get('/vendor/stats', protect, productController.getStats);

export default router;
