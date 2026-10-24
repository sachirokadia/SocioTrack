import mongoose, { Document, Schema } from 'mongoose';

// Society meeting: AGM, EAGM or general body meeting.
export interface IMeeting extends Document {
  title: string;
  type: 'agm' | 'eagm' | 'general';
  date: Date;
  venue?: string;
  agenda: string;
  minutes?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['agm', 'eagm', 'general'],
      default: 'general',
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Meeting date is required'],
    },
    venue: { type: String, trim: true },
    agenda: {
      type: String,
      required: [true, 'Agenda is required'],
      trim: true,
      maxlength: [5000, 'Agenda cannot exceed 5000 characters'],
    },
    minutes: {
      type: String,
      trim: true,
      maxlength: [10000, 'Minutes cannot exceed 10000 characters'],
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

meetingSchema.index({ date: -1, isActive: 1 });

const Meeting = mongoose.model<IMeeting>('Meeting', meetingSchema);

export default Meeting;
