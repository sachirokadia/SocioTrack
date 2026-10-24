// User Roles
export enum UserRole {
  RESIDENT = 'resident',
  ADMIN = 'admin',
  TECHNICIAN = 'technician'
}

// Complaint Status
export enum ComplaintStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

// Notice/Complaint Priority
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Notice Type
export type NoticeType = 'notice' | 'alert';

// Notification Type
export type NotificationType = 'notice' | 'alert';

// Complaint Categories
export const COMPLAINT_CATEGORIES = [
  'plumbing',
  'electrical',
  'cleaning',
  'security',
  'landscaping',
  'hvac',
  'pest_control',
  'general'
] as const;

export type ComplaintCategory = typeof COMPLAINT_CATEGORIES[number];

// User Interface
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  flatNumber?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Feedback Interface
export interface Feedback {
  rating: number;
  comment?: string;
  submittedAt: string;
}

// Complaint Interface
export interface Complaint {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: Priority;
  createdBy: User | string;
  technician?: User | string;
  images?: string[];
  location?: string;
  resolutionNote?: string;
  assignedAt?: string;
  resolvedAt?: string;
  estimatedCompletion?: string;
  feedback?: Feedback;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notice Interface
export interface Notice {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  type: NoticeType;
  priority: Priority;
  createdBy: User | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification Interface
export interface Notification {
  _id: string;
  id?: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedNotice?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    unreadCount?: number; // For notifications
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  flatNumber?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Complaint Types
export interface CreateComplaintRequest {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  location?: string;
  images?: string[];
}

export interface ComplaintFilters {
  status?: ComplaintStatus;
  category?: string;
  priority?: Priority;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Notice Types
export interface CreateNoticeRequest {
  title: string;
  description: string;
  type: NoticeType;
  priority: Priority;
}

// Billing Types (SocietyNow-style member dashboard / payments)
export type BillStatus = 'pending' | 'partial' | 'paid' | 'overdue';
export type PaymentMode = 'online' | 'cheque' | 'rtgs' | 'neft' | 'cash';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';
export type MeetingType = 'agm' | 'eagm' | 'general';

export interface Bill {
  _id: string;
  resident: User | string;
  title: string;
  category: string;
  period: string;
  amount: number;
  paidAmount: number;
  remainingAmount?: number;
  dueDate: string;
  status: BillStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
}

export interface Payment {
  _id: string;
  resident: User | string;
  bill?: Bill | string;
  amount: number;
  mode: PaymentMode;
  status: PaymentStatus;
  bankName?: string;
  branch?: string;
  chequeNumber?: string;
  chequeDate?: string;
  transactionNumber?: string;
  paymentDate: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  _id: string;
  title: string;
  type: MeetingType;
  date: string;
  venue?: string;
  agenda: string;
  minutes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  ref: string;
  kind: 'bill' | 'payment';
}

export interface Ledger {
  entries: LedgerEntry[];
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  advance: number;
}

export interface MemberSummary {
  lastBill: Bill | null;
  lastPayment: Payment | null;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  advance: number;
  unpaidBills: number;
}

export interface CreateBillRequest {
  residentId: string;
  title: string;
  category?: string;
  period: string;
  amount: number;
  dueDate: string;
  notes?: string;
}

export interface CreatePaymentRequest {
  billId?: string;
  residentId?: string;
  amount: number;
  mode: PaymentMode;
  bankName?: string;
  branch?: string;
  chequeNumber?: string;
  chequeDate?: string;
  transactionNumber?: string;
  paymentDate?: string;
  remarks?: string;
}

export interface CreateMeetingRequest {
  title: string;
  type: MeetingType;
  date: string;
  venue?: string;
  agenda: string;
  minutes?: string;
}

// Analytics Types
export interface Analytics {
  complaints: {
    total: number;
    byStatus: {
      pending: number;
      assigned: number;
      in_progress: number;
      resolved: number;
      rejected: number;
    };
    byCategory: Array<{
      category: string;
      count: number;
    }>;
  };
  users: {
    totalResidents: number;
    totalTechnicians: number;
  };
}
