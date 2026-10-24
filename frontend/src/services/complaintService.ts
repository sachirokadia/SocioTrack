import api from './api';
import { Complaint, CreateComplaintRequest, ComplaintFilters, ApiResponse, User } from '../types';

export const createComplaint = async (data: CreateComplaintRequest): Promise<Complaint> => {
  const response = await api.post<ApiResponse<Complaint>>('/complaints', data);
  return response.data.data!;
};

export const getComplaints = async (filters?: ComplaintFilters): Promise<{ complaints: Complaint[]; pagination: any }> => {
  const response = await api.get<ApiResponse<Complaint[]>>('/complaints', { params: filters });
  return {
    complaints: response.data.data || [],
    pagination: response.data.pagination,
  };
};

export const getComplaintById = async (id: string): Promise<Complaint> => {
  const response = await api.get<ApiResponse<Complaint>>(`/complaints/${id}`);
  return response.data.data!;
};

export const assignTechnician = async (complaintId: string, technicianId: string): Promise<Complaint> => {
  const response = await api.put<ApiResponse<Complaint>>(`/complaints/${complaintId}/assign`, { technicianId });
  return response.data.data!;
};

export const updateComplaintStatus = async (
  complaintId: string,
  status: string,
  resolutionNote?: string
): Promise<Complaint> => {
  const response = await api.put<ApiResponse<Complaint>>(`/complaints/${complaintId}/status`, {
    status,
    resolutionNote,
  });
  return response.data.data!;
};

export const submitFeedback = async (
  complaintId: string,
  feedback: { rating: number; comment?: string }
): Promise<Complaint> => {
  const response = await api.put<ApiResponse<Complaint>>(`/complaints/${complaintId}/feedback`, feedback);
  return response.data.data!;
};

export const getTechnicians = async (): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>('/complaints/technicians');
  return response.data.data || [];
};

export const getTechnicianDashboard = async (): Promise<any> => {
  const response = await api.get<ApiResponse<any>>('/complaints/dashboard/technician');
  return response.data.data!;
};
