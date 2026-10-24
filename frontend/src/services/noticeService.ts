import api from './api';
import { Notice, CreateNoticeRequest, ApiResponse } from '../types';

export const createNotice = async (data: CreateNoticeRequest): Promise<Notice> => {
  const response = await api.post<ApiResponse<Notice>>('/notices', data);
  return response.data.data!;
};

export const getNotices = async (params?: {
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<{ notices: Notice[]; pagination: any }> => {
  const response = await api.get<ApiResponse<Notice[]>>('/notices', { params });
  return {
    notices: response.data.data || [],
    pagination: response.data.pagination,
  };
};

export const getNoticeById = async (id: string): Promise<Notice> => {
  const response = await api.get<ApiResponse<Notice>>(`/notices/${id}`);
  return response.data.data!;
};

export const updateNotice = async (id: string, data: Partial<CreateNoticeRequest>): Promise<Notice> => {
  const response = await api.put<ApiResponse<Notice>>(`/notices/${id}`, data);
  return response.data.data!;
};

export const deleteNotice = async (id: string): Promise<void> => {
  await api.delete(`/notices/${id}`);
};
