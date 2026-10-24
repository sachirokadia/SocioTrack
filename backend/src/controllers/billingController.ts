import { Request, Response, NextFunction } from 'express';
import Bill from '../models/Bill';
import Payment from '../models/Payment';
import User from '../models/User';
import { UserRole, ApiResponse } from '../types';
import { asyncHandler, createAppError } from '../middleware/errorHandler';

// Present a bill with a computed 'overdue' status when its due date has
// passed and it is not fully paid, plus the amount still outstanding.
const presentBill = (bill: any) => {
  const obj = bill.toObject ? bill.toObject() : { ...bill };
  obj.remainingAmount = Math.max(0, obj.amount - (obj.paidAmount || 0));
  if (obj.status !== 'paid' && obj.dueDate && new Date(obj.dueDate) < new Date()) {
    obj.status = 'overdue';
  }
  return obj;
};

// Apply a verified payment to its bill (excess over the bill amount is
// not stored on the bill — it surfaces as advance in the summary/ledger).
const applyToBill = async (billId: any, amount: number) => {
  const bill = await Bill.findById(billId);
  if (!bill) return;
  bill.paidAmount = Math.min(bill.amount, bill.paidAmount + amount);
  bill.status = bill.paidAmount >= bill.amount
    ? 'paid'
    : bill.paidAmount > 0
      ? 'partial'
      : 'pending';
  await bill.save();
};

// Resolve which resident's data the caller may see: residents see only
// themselves, admins may pass ?residentId= (or a residentId in the body).
const targetResidentId = (req: Request, fromBody = false): string | undefined => {
  if (req.user?.role === UserRole.RESIDENT) return req.user.userId;
  return (fromBody ? (req.body.residentId as string | undefined) : undefined)
    || (req.query.residentId as string | undefined);
};

// ---- Bills ----

export const createBill = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return next(createAppError('User not authenticated', 401));

    const { residentId, title, category, period, amount, dueDate, notes } = req.body;
    if (!residentId || !title || !period || amount === undefined || !dueDate) {
      return next(createAppError('Resident, title, period, amount and due date are required', 400));
    }

    const resident = await User.findById(residentId);
    if (!resident || resident.role !== UserRole.RESIDENT) {
      return next(createAppError('Resident not found', 404));
    }

    const bill = await Bill.create({
      resident: residentId,
      title,
      category: category || 'maintenance',
      period,
      amount,
      dueDate,
      notes,
      createdBy: userId,
    });
    await bill.populate('resident', 'name email flatNumber');

    const response: ApiResponse<any> = {
      success: true,
      message: 'Bill created successfully',
      data: presentBill(bill),
    };
    res.status(201).json(response);
  }
);

export const getBills = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20, status } = req.query;
    const residentId = targetResidentId(req);
    const query: any = { isActive: true };
    if (residentId) query.resident = residentId;
    if (status && ['pending', 'partial', 'paid'].includes(status as string)) {
      query.status = status;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const [bills, total] = await Promise.all([
      Bill.find(query)
        .populate('resident', 'name email flatNumber')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Bill.countDocuments(query),
    ]);

    const response: ApiResponse<any[]> = {
      success: true,
      message: 'Bills retrieved successfully',
      data: bills.map(presentBill),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    };
    res.status(200).json(response);
  }
);

export const getBillById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bill = await Bill.findById(req.params.id)
      .populate('resident', 'name email flatNumber');
    if (!bill || !bill.isActive) return next(createAppError('Bill not found', 404));
    if (req.user?.role === UserRole.RESIDENT && String(bill.resident) !== req.user.userId
      && (bill.resident as any)._id && String((bill.resident as any)._id) !== req.user.userId) {
      return next(createAppError('Access denied', 403));
    }
    const payments = await Payment.find({ bill: bill._id }).sort({ createdAt: -1 });
    const response: ApiResponse<any> = {
      success: true,
      message: 'Bill retrieved successfully',
      data: { ...presentBill(bill), payments },
    };
    res.status(200).json(response);
  }
);

// ---- Payments ----

export const createPayment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return next(createAppError('User not authenticated', 401));

    const {
      billId, amount, mode, bankName, branch,
      chequeNumber, chequeDate, transactionNumber, paymentDate, remarks,
    } = req.body;

    if (!amount || !mode) {
      return next(createAppError('Amount and payment mode are required', 400));
    }
    if (!['online', 'cheque', 'rtgs', 'neft', 'cash'].includes(mode)) {
      return next(createAppError('Invalid payment mode', 400));
    }
    // Mode-specific intimation details, mirroring the Society Payments screen
    if (mode === 'cheque' && (!chequeNumber || !bankName)) {
      return next(createAppError('Cheque number and bank name are required for cheque payments', 400));
    }
    if ((mode === 'rtgs' || mode === 'neft') && !transactionNumber) {
      return next(createAppError('Transaction number is required for RTGS/NEFT payments', 400));
    }

    let residentId = targetResidentId(req, true);
    let bill = null;
    if (billId) {
      bill = await Bill.findById(billId);
      if (!bill || !bill.isActive) return next(createAppError('Bill not found', 404));
      // A bill pins the resident; an admin may still record for that resident
      residentId = String(bill.resident);
      if (req.user?.role === UserRole.RESIDENT && residentId !== userId) {
        return next(createAppError('Access denied', 403));
      }
    }
    if (!residentId) {
      return next(createAppError('Resident is required', 400));
    }

    // Online payments are verified immediately; offline intimations wait
    // for an admin to verify them before they count against the bill.
    const isOnline = mode === 'online';
    const payment = await Payment.create({
      resident: residentId,
      bill: billId || undefined,
      amount,
      mode,
      status: isOnline ? 'verified' : 'pending',
      bankName,
      branch,
      chequeNumber,
      chequeDate,
      transactionNumber,
      paymentDate: paymentDate || new Date(),
      remarks,
    });
    if (isOnline && bill) await applyToBill(bill._id, amount);
    await payment.populate('resident', 'name email flatNumber');

    const response: ApiResponse<any> = {
      success: true,
      message: isOnline
        ? 'Payment recorded and verified'
        : 'Payment intimation recorded — awaiting admin verification',
      data: payment,
    };
    res.status(201).json(response);
  }
);

export const getPayments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20, status, mode } = req.query;
    const residentId = targetResidentId(req);
    const query: any = {};
    if (residentId) query.resident = residentId;
    if (status) query.status = status;
    if (mode) query.mode = mode;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('resident', 'name email flatNumber')
        .populate('bill', 'title period amount')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Payment.countDocuments(query),
    ]);

    const response: ApiResponse<any[]> = {
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    };
    res.status(200).json(response);
  }
);

export const verifyPayment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return next(createAppError('User not authenticated', 401));

    const { status } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return next(createAppError('Status must be verified or rejected', 400));
    }
    const payment = await Payment.findById(req.params.id);
    if (!payment) return next(createAppError('Payment not found', 404));
    if (payment.status !== 'pending') {
      return next(createAppError(`Payment is already ${payment.status}`, 400));
    }

    payment.status = status;
    payment.verifiedBy = userId as any;
    await payment.save();
    if (status === 'verified' && payment.bill) {
      await applyToBill(payment.bill, payment.amount);
    }

    const response: ApiResponse<any> = {
      success: true,
      message: `Payment ${status} successfully`,
      data: payment,
    };
    res.status(200).json(response);
  }
);

// ---- Ledger & member summary ----

export const getLedger = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const residentId = targetResidentId(req);
    if (!residentId) return next(createAppError('Resident is required', 400));

    const [bills, payments] = await Promise.all([
      Bill.find({ resident: residentId, isActive: true }).sort({ createdAt: 1 }),
      Payment.find({ resident: residentId, status: 'verified' }).sort({ paymentDate: 1, createdAt: 1 }),
    ]);

    const entries: any[] = [
      ...bills.map((b: any) => ({
        date: b.createdAt,
        description: `${b.title} (${b.period})`,
        debit: b.amount,
        credit: 0,
        ref: String(b._id),
        kind: 'bill',
      })),
      ...payments.map((p: any) => ({
        date: p.paymentDate || p.createdAt,
        description: p.bill ? `Payment (${p.mode})` : `Payment (${p.mode})`,
        debit: 0,
        credit: p.amount,
        ref: String(p._id),
        kind: 'payment',
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let balance = 0;
    entries.forEach((e) => {
      balance += e.debit - e.credit;
      e.balance = balance;
    });

    const totalBilled = bills.reduce((sum: number, b: any) => sum + b.amount, 0);
    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    const response: ApiResponse<any> = {
      success: true,
      message: 'Ledger retrieved successfully',
      data: {
        entries,
        totalBilled,
        totalPaid,
        outstanding: Math.max(0, totalBilled - totalPaid),
        advance: Math.max(0, totalPaid - totalBilled),
      },
    };
    res.status(200).json(response);
  }
);

export const getMemberSummary = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const residentId = targetResidentId(req);
    if (!residentId) return next(createAppError('Resident is required', 400));

    const [bills, payments, lastBill, lastPayment] = await Promise.all([
      Bill.find({ resident: residentId, isActive: true }),
      Payment.find({ resident: residentId, status: 'verified' }),
      Bill.findOne({ resident: residentId, isActive: true }).sort({ createdAt: -1 }),
      Payment.findOne({ resident: residentId }).sort({ createdAt: -1 }),
    ]);

    const totalBilled = bills.reduce((sum: number, b: any) => sum + b.amount, 0);
    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    const response: ApiResponse<any> = {
      success: true,
      message: 'Member summary retrieved successfully',
      data: {
        lastBill: lastBill ? presentBill(lastBill) : null,
        lastPayment,
        totalBilled,
        totalPaid,
        outstanding: Math.max(0, totalBilled - totalPaid),
        advance: Math.max(0, totalPaid - totalBilled),
        unpaidBills: bills.filter((b: any) => b.status !== 'paid').length,
      },
    };
    res.status(200).json(response);
  }
);
