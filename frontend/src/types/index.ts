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
