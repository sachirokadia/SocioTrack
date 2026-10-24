import { Router } from 'express';
import { getAnalytics, getUsers } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(adminOnly);

// Analytics endpoint
router.get('/analytics', getAnalytics);

// Users endpoint (used by the Admin Users page; previously the
// controller existed but was never routed, so the page got a 404)
router.get('/users', getUsers);

export default router;
