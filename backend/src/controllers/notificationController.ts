import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { ApiResponse } from '../types';
import { asyncHandler, createAppError } from '../middleware/errorHandler';

// Get current user's notifications with unread count
export const getNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    const {
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // Use the static method from the model
    const result = await Notification.getUserNotifications(userId, {
      page: pageNum,
      limit: limitNum,
    });

    const response: ApiResponse<typeof result.notifications> = {
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      pagination: {
        ...result.pagination,
        // Add unreadCount to response for easy access
        unreadCount: result.unreadCount,
      } as any,
    };

    res.status(200).json(response);
  }
);

// Mark one notification as read
export const markAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    // Use the static method from the model
    const notification = await Notification.markAsRead(notificationId, userId);

    if (!notification) {
      return next(createAppError('Notification not found or access denied', 404));
    }

    const response: ApiResponse<typeof notification> = {
      success: true,
      message: 'Notification marked as read',
      data: notification,
    };

    res.status(200).json(response);
  }
);

// Mark all notifications as read for current user
export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      return next(createAppError('User not authenticated', 401));
    }

    // Use the static method from the model
    const modifiedCount = await Notification.markAllAsRead(userId);

    const response: ApiResponse<{ count: number }> = {
      success: true,
      message: `${modifiedCount} notification(s) marked as read`,
      data: { count: modifiedCount },
    };

    res.status(200).json(response);
  }
);
