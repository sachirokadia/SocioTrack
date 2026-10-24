import mongoose, { Document, Schema } from 'mongoose';
import { NoticePriority } from '../types';

// Notice type enum
export type NoticeType = 'notice' | 'alert';

// Interface for Notice document
export interface INotice extends Document {
  title: string;
  description: string;
  type: NoticeType;
  priority: NoticePriority;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Notice schema definition
const noticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: ['notice', 'alert'] as NoticeType[],
      default: 'notice',
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NoticePriority),
      default: NoticePriority.MEDIUM,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

// Compound indexes
noticeSchema.index({ type: 1, isActive: 1, createdAt: -1 });
noticeSchema.index({ priority: 1, createdAt: -1 });
noticeSchema.index({ createdBy: 1 });

// Static method to get notices for display (active notices, sorted newest first)
noticeSchema.statics.getPublishedNotices = async function (
  options?: { type?: NoticeType; page?: number; limit?: number }
) {
  const query: any = { isActive: true };
  
  if (options?.type) {
    query.type = options.type;
  }

  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;

  const [notices, total] = await Promise.all([
    this.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query),
  ]);

  return {
    notices,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Create and export Notice model
const Notice = mongoose.model<INotice>('Notice', noticeSchema);

export default Notice;