import mongoose, { Document, Schema } from 'mongoose';
import { ComplaintStatus, NoticePriority, UserRole } from '../types';

// Feedback subdocument interface
export interface IFeedback {
  rating: number;
  comment?: string;
  submittedAt: Date;
}

// Complaint status transition interface
export interface IComplaintStatusTransition {
  from: ComplaintStatus;
  to: ComplaintStatus;
  allowed: boolean;
  message: string;
}

// Interface for Complaint document
export interface IComplaint extends Document {
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: NoticePriority;
  createdBy: mongoose.Types.ObjectId;
  technician?: mongoose.Types.ObjectId;
  images?: string[];
  location?: string;
  resolutionNote?: string;
  assignedAt?: Date;
  resolvedAt?: Date;
  estimatedCompletion?: Date;
  feedback?: IFeedback;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Method to check if status transition is valid
  canTransitionTo(newStatus: ComplaintStatus): IComplaintStatusTransition;
  
  // Method to transition status
  transitionTo(newStatus: ComplaintStatus, note?: string): Promise<IComplaint>;
}

// Interface for Complaint model (static methods)
export interface IComplaintModel extends mongoose.Model<IComplaint> {
  getTechnicianComplaintsByStatus(technicianId: string): Promise<any>;
  getTechnicianComplaints(
    technicianId: string,
    options?: { status?: ComplaintStatus; page?: number; limit?: number }
  ): Promise<any>;
}

// Allowed status transitions
const STATUS_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  [ComplaintStatus.PENDING]: [ComplaintStatus.ASSIGNED],
  [ComplaintStatus.ASSIGNED]: [ComplaintStatus.IN_PROGRESS],
  [ComplaintStatus.IN_PROGRESS]: [ComplaintStatus.RESOLVED],
  [ComplaintStatus.RESOLVED]: [],
  [ComplaintStatus.REJECTED]: [],
};

// Status transition messages
const STATUS_MESSAGES: Record<string, string> = {
  'pending_to_assigned': 'Complaint has been assigned to a technician',
  'assigned_to_in_progress': 'Complaint work has started',
  'in_progress_to_resolved': 'Complaint has been resolved',
  'pending_to_assigned_error': 'Cannot start work on complaint until it is assigned',
  'assigned_to_resolved_error': 'Must start work before marking as resolved',
  'in_progress_to_assigned_error': 'Cannot go back to assigned status',
  'in_progress_to_pending_error': 'Cannot go back to pending status',
  'resolved_to_any_error': 'Cannot change status of resolved complaint',
  'rejected_to_any_error': 'Cannot change status of rejected complaint',
  'invalid_transition': 'Invalid status transition',
};

// Feedback subdocument schema
const feedbackSchema = new Schema<IFeedback>(
  {
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Complaint schema definition
const complaintSchema = new Schema<IComplaint>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['plumbing', 'electrical', 'cleaning', 'security', 'landscaping', 'hvac', 'pest_control', 'general'],
        message: 'Invalid category',
      },
    },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.PENDING,
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
      index: true,
    },
    technician: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    images: [{
      type: String,
    }],
    location: {
      type: String,
      trim: true,
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution note cannot exceed 1000 characters'],
    },
    assignedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    estimatedCompletion: {
      type: Date,
    },
    feedback: {
      type: feedbackSchema,
      default: undefined,
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

// Compound indexes for common queries
complaintSchema.index({ status: 1, isActive: 1 });
complaintSchema.index({ technician: 1, status: 1 });
complaintSchema.index({ createdBy: 1, status: 1 });
complaintSchema.index({ category: 1, status: 1 });

// Instance method to check if status transition is valid
complaintSchema.methods.canTransitionTo = function(
  newStatus: ComplaintStatus
): IComplaintStatusTransition {
  const currentStatus = this.status;
  
  // Check if current complaint can transition to new status
  if (currentStatus === ComplaintStatus.RESOLVED) {
    return {
      from: currentStatus,
      to: newStatus,
      allowed: false,
      message: STATUS_MESSAGES['resolved_to_any_error'],
    };
  }
  
  if (currentStatus === ComplaintStatus.REJECTED) {
    return {
      from: currentStatus,
      to: newStatus,
      allowed: false,
      message: STATUS_MESSAGES['rejected_to_any_error'],
    };
  }
  
  // Check if the transition is allowed
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  const isAllowed = allowedTransitions.includes(newStatus);
  
  if (!isAllowed) {
    return {
      from: currentStatus,
      to: newStatus,
      allowed: false,
      message: STATUS_MESSAGES['invalid_transition'],
    };
  }
  
  return {
    from: currentStatus,
    to: newStatus,
    allowed: true,
    message: STATUS_MESSAGES[`${currentStatus}_to_${newStatus}`] || 'Status transition allowed',
  };
};

// Instance method to transition status
complaintSchema.methods.transitionTo = async function(
  newStatus: ComplaintStatus,
  note?: string
): Promise<IComplaint> {
  const transition = this.canTransitionTo(newStatus);
  
  if (!transition.allowed) {
    throw new Error(transition.message);
  }
  
  // Update the status
  this.status = newStatus;
  
  // Set resolvedAt if transitioning to resolved
  if (newStatus === ComplaintStatus.RESOLVED) {
    this.resolvedAt = new Date();
    
    // Require resolution note when resolving
    if (!note || note.trim().length === 0) {
      throw new Error('Resolution note is required when marking complaint as resolved');
    }
    this.resolutionNote = note;
  }
  
  // Save the complaint
  await this.save();
  return this;
};

// Static method to get technician's assigned complaints
complaintSchema.statics.getTechnicianComplaints = async function(
  technicianId: string,
  options?: { status?: ComplaintStatus; page?: number; limit?: number }
) {
  const query: any = {
    technician: technicianId,
    isActive: true,
  };
  
  if (options?.status) {
    query.status = options.status;
  }
  
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;
  
  const [complaints, total] = await Promise.all([
    this.find(query)
      .populate('createdBy', 'name email flatNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query),
  ]);
  
  return {
    complaints,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Static method to get complaints grouped by status for a technician
complaintSchema.statics.getTechnicianComplaintsByStatus = async function(
  technicianId: string
) {
  const result = await this.aggregate([
    {
      $match: {
        technician: new mongoose.Types.ObjectId(technicianId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        complaints: {
          $push: {
            id: '$_id',
            title: '$title',
            priority: '$priority',
            category: '$category',
            createdAt: '$createdAt',
            resolvedAt: '$resolvedAt',
          },
        },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
  
  // Format the result
  const grouped: Record<ComplaintStatus, { count: number; complaints: any[] }> = {
    [ComplaintStatus.PENDING]: { count: 0, complaints: [] },
    [ComplaintStatus.ASSIGNED]: { count: 0, complaints: [] },
    [ComplaintStatus.IN_PROGRESS]: { count: 0, complaints: [] },
    [ComplaintStatus.RESOLVED]: { count: 0, complaints: [] },
    [ComplaintStatus.REJECTED]: { count: 0, complaints: [] },
  };
  
  result.forEach((item) => {
    grouped[item._id as ComplaintStatus] = {
      count: item.count,
      complaints: item.complaints,
    };
  });
  
  return grouped;
};

// Create and export Complaint model
const Complaint = mongoose.model<IComplaint, IComplaintModel>('Complaint', complaintSchema);

export default Complaint;