import { Router } from 'express';
import {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Read access for all authenticated users
router.get('/', getNotices);
router.get('/:id', getNoticeById);

// Admin-only routes (create, update, delete)
router.post('/', adminOnly, createNotice);
router.put('/:id', adminOnly, updateNotice);
router.delete('/:id', adminOnly, deleteNotice);

export default router;
