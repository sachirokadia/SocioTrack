import mongoose, { Document, Schema } from 'mongoose';

// Maintenance bill raised by an admin for one resident (one flat).
export interface IBill extends Document {
  resident: mongoose.Types.ObjectId;
  title: string;
  category: string;
  period: string;
  amount: number;
  paidAmount: number;
  dueDate: Date;
  status: 'pending' | 'partial' | 'paid';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const billSchema = new Schema<IBill>(
  {
    resident: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      trim: true,
      default: 'maintenance',
    },
    period: {
      type: String,
      trim: true,
      required: [true, 'Billing period is required (e.g. Oct 2026)'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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

billSchema.index({ resident: 1, createdAt: -1 });
billSchema.index({ resident: 1, status: 1 });

const Bill = mongoose.model<IBill>('Bill', billSchema);

export default Bill;
