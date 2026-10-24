import { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  refreshToken,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', authenticate, refreshToken);

export default router;
