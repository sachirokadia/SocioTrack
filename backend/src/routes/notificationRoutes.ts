import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user's notifications
router.get('/', getNotifications);

// Mark notifications as read
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
