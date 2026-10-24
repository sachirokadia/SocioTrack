import { Request, Response, NextFunction } from 'express';
import Complaint, { IComplaint } from '../models/Complaint';
import User from '../models/User';
import { ComplaintStatus, NoticePriority, ApiResponse, JwtPayload } from '../types';
import { asyncHandler, createAppError } from '../middleware/errorHandler';

// Create a new complaint
export const createComplaint = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    const complaintData = {
      ...req.body,
      createdBy: userId,
    };

    const complaint = await Complaint.create(complaintData);
    
    await complaint.populate('createdBy', 'name email flatNumber');

    const response: ApiResponse<IComplaint> = {
      success: true,
      message: 'Complaint created successfully',
      data: complaint,
    };

    res.status(201).json(response);
  }
);

// Get all complaints (role-based filtering)
export const getComplaints = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query based on role
    let query: any = { isActive: true };

    if (userRole === 'resident') {
      // Residents can only see their own complaints
      query.createdBy = userId;
    } else if (userRole === 'technician') {
      // Technicians can only see complaints assigned to them
      query.technician = userId;
    }
    // Admin can see all complaints (no additional filter)

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('createdBy', 'name email flatNumber')
        .populate('technician', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(query),
    ]);

    const response: ApiResponse<IComplaint[]> = {
      success: true,
      message: 'Complaints retrieved successfully',
      data: complaints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };

    res.status(200).json(response);
  }
);

// Get single complaint by ID
export const getComplaintById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const complaintId = req.params.id;

    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    const complaint = await Complaint.findById(complaintId)
      .populate('createdBy', 'name email flatNumber phone')
      .populate('technician', 'name email phone');

    if (!complaint) {
      return next(createAppError('Complaint not found', 404));
    }

    // Check access rights
    if (userRole === 'resident') {
      // Check if createdBy populated successfully
      if (!complaint.createdBy || !complaint.createdBy._id) {
        return next(createAppError('Complaint creator information is unavailable', 404));
      }
      if (complaint.createdBy._id.toString() !== userId) {
        return next(createAppError('Access denied. You can only view your own complaints.', 403));
      }
    }

    if (userRole === 'technician') {
      // Check if technician exists and populated successfully
      if (!complaint.technician) {
        return next(createAppError('Access denied. This complaint is not assigned to you.', 403));
      }
      if (!complaint.technician._id) {
        return next(createAppError('Complaint technician information is unavailable', 404));
      }
      if (complaint.technician._id.toString() !== userId) {
        return next(createAppError('Access denied. This complaint is not assigned to you.', 403));
      }
    }

    const response: ApiResponse<IComplaint> = {
      success: true,
      message: 'Complaint retrieved successfully',
      data: complaint,
    };

    res.status(200).json(response);
  }
);

// Assign technician to complaint (admin only)
export const assignTechnician = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { technicianId } = req.body;
    const complaintId = req.params.id;
    const adminId = req.user?.userId;

    if (!adminId) {
      return next(createAppError('User not authenticated', 401));
    }

    // Validate technician exists and has technician role
    const technician = await User.findOne({ _id: technicianId, role: 'technician', isActive: true });
    if (!technician) {
      return next(createAppError('Invalid technician. User must be an active technician.', 400));
    }

    // Find complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return next(createAppError('Complaint not found', 404));
    }

    // Check if already assigned
    if (complaint.technician) {
      return next(createAppError('Complaint is already assigned to a technician', 400));
    }

    // Check status - can only assign pending complaints
    if (complaint.status !== ComplaintStatus.PENDING) {
      return next(createAppError('Can only assign pending complaints', 400));
    }

    // Update complaint
    complaint.technician = technicianId;
    complaint.status = ComplaintStatus.ASSIGNED;
    complaint.assignedAt = new Date();

    await complaint.save();
    await complaint.populate('createdBy', 'name email flatNumber');
    await complaint.populate('technician', 'name email');

    const response: ApiResponse<IComplaint> = {
      success: true,
      message: 'Technician assigned successfully. Complaint status updated to Assigned.',
      data: complaint,
    };

    res.status(200).json(response);
  }
);

// Update complaint status (technician only, for assigned complaints)
export const updateComplaintStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, resolutionNote } = req.body;
    const complaintId = req.params.id;
    const technicianId = req.user?.userId;

    if (!technicianId) {
      return next(createAppError('User not authenticated', 401));
    }

    // Validate status
    if (!Object.values(ComplaintStatus).includes(status)) {
      return next(createAppError('Invalid status', 400));
    }

    // Find complaint
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return next(createAppError('Complaint not found', 404));
    }

    // Check if complaint is assigned to this technician
    if (!complaint.technician || complaint.technician.toString() !== technicianId) {
      return next(createAppError('Access denied. This complaint is not assigned to you.', 403));
    }

    // Check status transition
    const transition = complaint.canTransitionTo(status);
    if (!transition.allowed) {
      return next(createAppError(transition.message, 400));
    }

    // Validate resolution note when moving to resolved
    if (status === ComplaintStatus.RESOLVED) {
      if (!resolutionNote || resolutionNote.trim().length === 0) {
        return next(createAppError('Resolution note is required when marking complaint as resolved', 400));
      }
    }

    // Update complaint status
    complaint.status = status;
    
    if (status === ComplaintStatus.ASSIGNED) {
      complaint.assignedAt = new Date();
    } else if (status === ComplaintStatus.IN_PROGRESS) {
      // No additional fields needed
    } else if (status === ComplaintStatus.RESOLVED) {
      complaint.resolvedAt = new Date();
      complaint.resolutionNote = resolutionNote;
    }

    await complaint.save();
    await complaint.populate('createdBy', 'name email flatNumber');
    await complaint.populate('technician', 'name email');

    const response: ApiResponse<IComplaint> = {
      success: true,
      message: transition.message,
      data: complaint,
    };

    res.status(200).json(response);
  }
);

// Get technicians list (for admin dropdown)
export const getTechnicians = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const technicians = await User.find({ role: 'technician', isActive: true })
      .select('name email phone flatNumber')
      .sort({ name: 1 });

    const response: ApiResponse<typeof technicians> = {
      success: true,
      message: 'Technicians retrieved successfully',
      data: technicians,
    };

    res.status(200).json(response);
  }
);

// Get technician's assigned complaints grouped by status
export const getTechnicianDashboard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const technicianId = req.user?.userId;

    if (!technicianId) {
      return next(createAppError('User not authenticated', 401));
    }

    const groupedComplaints = await Complaint.getTechnicianComplaintsByStatus(technicianId);

    // Calculate summary
    const summary = {
      assigned: groupedComplaints[ComplaintStatus.ASSIGNED].count,
      inProgress: groupedComplaints[ComplaintStatus.IN_PROGRESS].count,
      pending: groupedComplaints[ComplaintStatus.PENDING].count,
      resolved: groupedComplaints[ComplaintStatus.RESOLVED].count,
      total: 0,
    };
    summary.total = summary.assigned + summary.inProgress + summary.pending + summary.resolved;

    const response: ApiResponse<{
      groupedComplaints: typeof groupedComplaints;
      summary: typeof summary;
    }> = {
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        groupedComplaints,
        summary,
      },
    };

    res.status(200).json(response);
  }
);

// Submit feedback for a resolved complaint (resident only)
export const submitFeedback = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const complaintId = req.params.id;
    const userId = req.user?.userId;
    const { rating, comment } = req.body;

    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    // Find complaint
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return next(createAppError('Complaint not found', 404));
    }

    // Check if requester is the resident who created the complaint
    if (!complaint.createdBy) {
      return next(createAppError('Complaint creator information is unavailable', 404));
    }
    if (complaint.createdBy.toString() !== userId) {
      return next(createAppError('Access denied. You can only submit feedback on your own complaints.', 403));
    }

    // Check if complaint is resolved
    if (complaint.status !== ComplaintStatus.RESOLVED) {
      return next(createAppError('Feedback can only be submitted for resolved complaints', 400));
    }

    // Check if feedback already exists
    if (complaint.feedback) {
      return next(createAppError('Feedback has already been submitted for this complaint', 400));
    }

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return next(createAppError('Rating must be a number between 1 and 5', 400));
    }

    // Set feedback
    complaint.feedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date(),
    };

    await complaint.save();

    await complaint.populate('createdBy', 'name email flatNumber');
    await complaint.populate('technician', 'name email');

    const response: ApiResponse<IComplaint> = {
      success: true,
      message: 'Feedback submitted successfully',
      data: complaint,
    };

    res.status(200).json(response);
  }
);
