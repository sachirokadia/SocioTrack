import { Document, Types } from 'mongoose';

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

// Notice Priority
export enum NoticePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Alert Type
export enum AlertType {
  MAINTENANCE = 'maintenance',
  SECURITY = 'security',
  EMERGENCY = 'emergency',
  GENERAL = 'general'
}

// Base Interface
export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User Interface
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  flatNumber?: string;
  phoneNumber?: string;
  profilePicture?: string;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Complaint Interface
export interface IComplaint extends BaseDocument {
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: NoticePriority;
  createdBy: Types.ObjectId | IUser;
  assignedTo?: Types.ObjectId | IUser;
  images?: string[];
  location?: string;
  remarks?: string;
  resolvedAt?: Date;
  estimatedCompletion?: Date;
}

// Notice Interface
export interface INotice extends BaseDocument {
  title: string;
  content: string;
  priority: NoticePriority;
  category: string;
  issuedBy: Types.ObjectId | IUser;
  validUntil?: Date;
  isActive: boolean;
  attachments?: string[];
}

// Alert Interface
export interface IAlert extends BaseDocument {
  title: string;
  message: string;
  type: AlertType;
  issuedBy: Types.ObjectId | IUser;
  targetedRoles: UserRole[];
  isActive: boolean;
  expiresAt?: Date;
  acknowledgedBy: Types.ObjectId[];
}

// Feedback Interface
export interface IFeedback extends BaseDocument {
  user: Types.ObjectId | IUser;
  complaint?: Types.ObjectId | IComplaint;
  rating: number;
  comment?: string;
  category: string;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
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
  };
}

// Request Types
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

// Query Parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter Query for Complaints
export interface ComplaintFilterQuery extends PaginationQuery {
  status?: ComplaintStatus;
  category?: string;
  priority?: NoticePriority;
  createdBy?: string;
  assignedTo?: string;
}

// Filter Query for Notices
export interface NoticeFilterQuery extends PaginationQuery {
  priority?: NoticePriority;
  category?: string;
  isActive?: string;
}

// Login Request
export interface LoginRequest {
  email: string;
  password: string;
}

// Register Request
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  flatNumber?: string;
  phoneNumber?: string;
}

// Complaint Create Request
export interface CreateComplaintRequest {
  title: string;
  description: string;
  category: string;
  priority: NoticePriority;
  images?: string[];
  location?: string;
}

// Notice Create Request
export interface CreateNoticeRequest {
  title: string;
  content: string;
  priority: NoticePriority;
  category: string;
  validUntil?: string;
  attachments?: string[];
}

// Alert Create Request
export interface CreateAlertRequest {
  title: string;
  message: string;
  type: AlertType;
  targetedRoles: UserRole[];
  expiresAt?: string;
}