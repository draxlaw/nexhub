import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(protect, requireAdmin);

// ============ DASHBOARD ============
router.get('/dashboard/stats', adminController.getDashboardStats);

// ============ USER MANAGEMENT ============
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.patch('/users/:userId/verify-email', adminController.verifyUserEmail);
router.patch('/users/:userId/deactivate', adminController.deactivateUser);

// ============ PRODUCT MANAGEMENT ============
router.get('/products', adminController.getAllProducts);
router.patch('/products/:productId/approve', adminController.approveProduct);
router.patch('/products/:productId/reject', adminController.rejectProduct);
router.patch('/products/:productId/toggle-status', adminController.toggleProductStatus);

// ============ VENDOR MANAGEMENT ============
router.get('/vendors/pending', adminController.getPendingVendors);
router.patch('/vendors/:vendorId/approve', adminController.approveVendor);
router.patch('/vendors/:vendorId/reject', adminController.rejectVendor);
router.patch('/vendors/:vendorId/activate', adminController.activateVendor);
router.patch('/vendors/:vendorId/reactivate', adminController.reactivateVendor);
router.patch('/vendors/:vendorId/deactivate', adminController.deactivateVendor);
router.patch('/vendors/:vendorId/toggle-status', adminController.toggleVendorStatus);

// ============ CATEGORY MANAGEMENT ============
router.get('/categories', adminController.getAllCategories);
router.patch('/categories/:categoryId/toggle-status', adminController.toggleCategoryStatus);

// ============ REPORTS & ANALYTICS ============
router.get('/reports/vendor-performance', adminController.getVendorPerformance);
router.get('/reports/top-products', adminController.getTopProducts);

export default router;
