import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Mount sub-routers here
router.use('/auth', authRoutes);

export default router;
