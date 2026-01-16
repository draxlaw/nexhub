import { Router } from 'express';
import * as vendorController from '../controllers/vendor.controller';
import { protect } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public routes
router.get('/', vendorController.getAllVendors);
router.get('/:vendorId', vendorController.getVendor);

// Vendor protected routes
router.post('/register', protect, vendorController.registerVendor);
router.get('/me', protect, vendorController.getVendorProfile);
router.put('/me', protect, vendorController.updateVendorProfile);

// Admin protected routes
router.patch('/:vendorId/approve', protect, requireAdmin, vendorController.approveVendor);
router.patch('/:vendorId/reject', protect, requireAdmin, vendorController.rejectVendor);
router.patch('/:vendorId/deactivate', protect, requireAdmin, vendorController.deactivateVendor);

export default router;
