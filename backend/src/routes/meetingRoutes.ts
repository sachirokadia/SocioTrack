import { Router } from 'express';
import { createMeeting, getMeetings, deleteMeeting } from '../controllers/meetingController';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/role';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', adminOnly, createMeeting);
router.get('/', getMeetings);
router.delete('/:id', adminOnly, deleteMeeting);

export default router;
