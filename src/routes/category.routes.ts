import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:categoryId', categoryController.getCategory);

// Admin protected routes
router.post('/', protect, requireAdmin, categoryController.createCategory);
router.put('/:categoryId', protect, requireAdmin, categoryController.updateCategory);
router.delete('/:categoryId', protect, requireAdmin, categoryController.deleteCategory);

export default router;
