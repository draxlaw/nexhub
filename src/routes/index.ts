import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import vendorRoutes from './vendor.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Mount sub-routers here
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/vendors', vendorRoutes);
router.use('/admin', adminRoutes);

export default router;
