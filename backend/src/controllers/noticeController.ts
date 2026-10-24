import { Request, Response, NextFunction } from 'express';
import Notice, { INotice } from '../models/Notice';
import Notification, { NotificationType } from '../models/Notification';
import User from '../models/User';
import { UserRole, ApiResponse } from '../types';
import { asyncHandler, createAppError } from '../middleware/errorHandler';

// Create a new notice or alert
export const createNotice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    
    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    const { title, description, type, priority } = req.body;

    // Validate required fields
    if (!title || !description) {
      return next(createAppError('Title and description are required', 400));
    }

    // Create notice
    const noticeData = {
      title,
      description,
      type: type || 'notice',
      priority: priority || 'medium',
      createdBy: userId,
    };

    const notice = await Notice.create(noticeData);
    await notice.populate('createdBy', 'name email');

    // If type is 'alert', fan out notifications to all residents
    if (type === 'alert') {
      // Get all residents
      const residents = await User.find({ role: UserRole.RESIDENT, isActive: true });

      if (residents.length > 0) {
        // Create notification for each resident
        const notifications = residents.map(resident => ({
          user: resident._id,
          title: `New Alert: ${title}`,
          message: description,
          type: 'alert' as NotificationType,
          relatedNotice: notice._id,
        }));

        await Notification.createBulk(notifications);
      }
    }

    const response: ApiResponse<INotice> = {
      success: true,
      message: type === 'alert' ? 'Alert created and notifications sent to residents' : 'Notice created successfully',
      data: notice,
    };

    res.status(201).json(response);
  }
);

// Get all notices (with filters)
export const getNotices = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      page = 1,
      limit = 10,
      type,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query: any = { isActive: true };

    if (type) query.type = type;
    if (priority) query.priority = priority;

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [notices, total] = await Promise.all([
      Notice.find(query)
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Notice.countDocuments(query),
    ]);

    const response: ApiResponse<INotice[]> = {
      success: true,
      message: 'Notices retrieved successfully',
      data: notices,
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

// Get single notice by ID
export const getNoticeById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const noticeId = req.params.id;

    const notice = await Notice.findById(noticeId)
      .populate('createdBy', 'name email');

    if (!notice) {
      return next(createAppError('Notice not found', 404));
    }

    const response: ApiResponse<INotice> = {
      success: true,
      message: 'Notice retrieved successfully',
      data: notice,
    };

    res.status(200).json(response);
  }
);

// Update a notice (admin only)
export const updateNotice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const noticeId = req.params.id;
    const { title, description, type, priority } = req.body;

    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return next(createAppError('Notice not found', 404));
    }

    // Update fields if provided
    if (title) notice.title = title;
    if (description) notice.description = description;
    if (type) notice.type = type;
    if (priority) notice.priority = priority;

    await notice.save();
    await notice.populate('createdBy', 'name email');

    const response: ApiResponse<INotice> = {
      success: true,
      message: 'Notice updated successfully',
      data: notice,
    };

    res.status(200).json(response);
  }
);

// Delete a notice (soft delete - admin only)
export const deleteNotice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const noticeId = req.params.id;

    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return next(createAppError('Notice not found', 404));
    }

    // Soft delete
    notice.isActive = false;
    await notice.save();

    const response: ApiResponse = {
      success: true,
      message: 'Notice deleted successfully',
    };

    res.status(200).json(response);
  }
);
