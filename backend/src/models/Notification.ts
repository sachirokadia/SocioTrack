import mongoose, { Document, Schema } from 'mongoose';
import { NoticeType } from './Notice';

// Notification type enum
export type NotificationType = 'notice' | 'alert';

// Interface for Notification document
export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  relatedNotice?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Notification model (static methods)
export interface INotificationModel extends mongoose.Model<INotification> {
  getUserNotifications(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{
    notifications: INotification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>;
  markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<number>;
  createBulk(
    notifications: Array<{
      user: mongoose.Types.ObjectId;
      title: string;
      message: string;
      type: NotificationType;
      relatedNotice?: mongoose.Types.ObjectId;
    }>
  ): Promise<INotification[]>;
}

// Notification schema definition
const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: ['notice', 'alert'] as NotificationType[],
      default: 'notice',
      index: true,
    },
    relatedNotice: {
      type: Schema.Types.ObjectId,
      ref: 'Notice',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.__v = undefined;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1, createdAt: -1 });

// Static method to get user's notifications with unread count
notificationSchema.statics.getUserNotifications = async function (
  userId: string,
  options?: { page?: number; limit?: number }
) {
  const query: any = { user: userId };

  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    this.find(query)
      .populate('relatedNotice', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query),
    this.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Static method to mark one notification as read
notificationSchema.statics.markAsRead = async function (
  notificationId: string,
  userId: string
) {
  const notification = await this.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  return notification;
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function (userId: string) {
  const result = await this.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return result.modifiedCount;
};

// Static method to create notifications in bulk (for alert fan-out)
notificationSchema.statics.createBulk = async function (
  notifications: Array<{
    user: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    relatedNotice?: mongoose.Types.ObjectId;
  }>
) {
  const created = await this.insertMany(notifications);
  return created;
};

// Create and export Notification model
const Notification = mongoose.model<INotification, INotificationModel>('Notification', notificationSchema);

export default Notification;