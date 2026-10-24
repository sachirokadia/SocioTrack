import { Request, Response, NextFunction } from 'express';
import Meeting from '../models/Meeting';
import { ApiResponse } from '../types';
import { asyncHandler, createAppError } from '../middleware/errorHandler';

export const createMeeting = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return next(createAppError('User not authenticated', 401));

    const { title, type, date, venue, agenda, minutes } = req.body;
    if (!title || !date || !agenda) {
      return next(createAppError('Title, date and agenda are required', 400));
    }

    const meeting = await Meeting.create({
      title,
      type: type || 'general',
      date,
      venue,
      agenda,
      minutes,
      createdBy: userId,
    });
    await meeting.populate('createdBy', 'name email');

    const response: ApiResponse<any> = {
      success: true,
      message: 'Meeting created successfully',
      data: meeting,
    };
    res.status(201).json(response);
  }
);

export const getMeetings = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20, type } = req.query;
    const query: any = { isActive: true };
    if (type) query.type = type;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const [meetings, total] = await Promise.all([
      Meeting.find(query)
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Meeting.countDocuments(query),
    ]);

    const response: ApiResponse<any[]> = {
      success: true,
      message: 'Meetings retrieved successfully',
      data: meetings,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    };
    res.status(200).json(response);
  }
);

export const deleteMeeting = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return next(createAppError('Meeting not found', 404));
    meeting.isActive = false;
    await meeting.save();
    const response: ApiResponse = {
      success: true,
      message: 'Meeting deleted successfully',
    };
    res.status(200).json(response);
  }
);
