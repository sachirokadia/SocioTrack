import { Router } from 'express';
import { getAnalytics } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Analytics endpoint
router.get('/analytics', getAnalytics);

export default router;
