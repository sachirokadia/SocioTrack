import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignTechnician,
  updateComplaintStatus,
  getTechnicians,
  getTechnicianDashboard,
  submitFeedback,
} from '../controllers/complaintController';
import { authenticate } from '../middleware/auth';
import { role, adminOnly, technicianOnly } from '../middleware/role';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get technicians list (for admin and technicians)
router.get('/technicians', role([UserRole.ADMIN, UserRole.TECHNICIAN]), getTechnicians);

// Technician dashboard
router.get('/dashboard/technician', technicianOnly, getTechnicianDashboard);

// Complaint CRUD
router.post('/', role([UserRole.RESIDENT, UserRole.ADMIN]), createComplaint);
router.get('/', getComplaints); // Role-based filtering in controller
router.get('/:id', getComplaintById); // Role-based access check in controller

// Admin actions
router.put('/:id/assign', adminOnly, assignTechnician);

// Technician actions
router.put('/:id/status', technicianOnly, updateComplaintStatus);

// Resident actions
router.put('/:id/feedback', role([UserRole.RESIDENT]), submitFeedback);

export default router;
