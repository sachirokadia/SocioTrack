import mongoose, { Document, Schema } from 'mongoose';

// A payment against a bill, or a payment intimation (cheque / RTGS /
// NEFT) awaiting admin verification. Offline intimations do not reduce
// the bill until an admin verifies them.
export interface IPayment extends Document {
  resident: mongoose.Types.ObjectId;
  bill?: mongoose.Types.ObjectId;
  amount: number;
  mode: 'online' | 'cheque' | 'rtgs' | 'neft' | 'cash';
  status: 'pending' | 'verified' | 'rejected';
  bankName?: string;
  branch?: string;
  chequeNumber?: string;
  chequeDate?: Date;
  transactionNumber?: string;
  paymentDate: Date;
  remarks?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    resident: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident is required'],
      index: true,
    },
    bill: {
      type: Schema.Types.ObjectId,
      ref: 'Bill',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    mode: {
      type: String,
      enum: ['online', 'cheque', 'rtgs', 'neft', 'cash'],
      required: [true, 'Payment mode is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    bankName: { type: String, trim: true },
    branch: { type: String, trim: true },
    chequeNumber: { type: String, trim: true },
    chequeDate: { type: Date },
    transactionNumber: { type: String, trim: true },
    paymentDate: {
      type: Date,
      default: () => new Date(),
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

paymentSchema.index({ resident: 1, createdAt: -1 });
paymentSchema.index({ bill: 1, status: 1 });

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
