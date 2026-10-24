import { Router } from 'express';
import {
  createBill,
  getBills,
  getBillById,
  createPayment,
  getPayments,
  verifyPayment,
  getLedger,
  getMemberSummary,
} from '../controllers/billingController';
import { authenticate } from '../middleware/auth';
import { role, adminOnly } from '../middleware/role';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Member dashboard summary (resident: self, admin: ?residentId=)
router.get('/summary', role([UserRole.RESIDENT, UserRole.ADMIN]), getMemberSummary);

// Ledger (resident: self, admin: ?residentId=)
router.get('/ledger', role([UserRole.RESIDENT, UserRole.ADMIN]), getLedger);

// Bills
router.post('/bills', adminOnly, createBill);
router.get('/bills', role([UserRole.RESIDENT, UserRole.ADMIN]), getBills);
router.get('/bills/:id', role([UserRole.RESIDENT, UserRole.ADMIN]), getBillById);

// Payments
router.post('/payments', role([UserRole.RESIDENT, UserRole.ADMIN]), createPayment);
router.get('/payments', role([UserRole.RESIDENT, UserRole.ADMIN]), getPayments);
router.put('/payments/:id/verify', adminOnly, verifyPayment);

export default router;
