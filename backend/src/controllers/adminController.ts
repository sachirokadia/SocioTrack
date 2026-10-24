import { Request, Response, NextFunction } from 'express';
import Complaint from '../models/Complaint';
import User from '../models/User';
import { UserRole, ComplaintStatus, ApiResponse } from '../types';
import { asyncHandler, createAppError } from '../middleware/errorHandler';

// Get admin analytics dashboard data
export const getAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    // Get complaint counts by status
    const complaintsByStatus = await Complaint.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    

    // Format status counts
    const statusCounts: Record<string, number> = {
      pending: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };

    complaintsByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    // Get total counts by role
    const [totalResidents, totalTechnicians] = await Promise.all([
      User.countDocuments({ role: UserRole.RESIDENT, isActive: true }),
      User.countDocuments({ role: UserRole.TECHNICIAN, isActive: true }),
    ]);

    // Get complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Format category breakdown
    const categoryBreakdown = complaintsByCategory.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    // Get total complaint count
    const totalComplaints = await Complaint.countDocuments({ isActive: true });

    const analytics = {
      complaints: {
        total: totalComplaints,
        byStatus: statusCounts,
        byCategory: categoryBreakdown,
      },
      users: {
        totalResidents,
        totalTechnicians,
      },
    };

    const response: ApiResponse<typeof analytics> = {
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics,
    };

    res.status(200).json(response);
  }
);

// Get users, optionally filtered by role (used by the Admin Users page)
export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.query;

    const filter: Record<string, unknown> = { isActive: true };

    // Only filter by role if a valid one was passed — an unrecognized
    // value just falls through to an empty result set rather than
    // guessing at your createAppError(...) signature here
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password');

    const response: ApiResponse<typeof users> = {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    };

    res.status(200).json(response);
  }
);