import api from './api';
import { Notification, ApiResponse } from '../types';

export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{ notifications: Notification[]; unreadCount: number; pagination: any }> => {
  const response = await api.get<ApiResponse<Notification[]>>('/notifications', { params });
  return {
    notifications: response.data.data || [],
    unreadCount: response.data.pagination?.unreadCount || 0,
    pagination: response.data.pagination,
  };
};

export const markAsRead = async (id: string): Promise<Notification> => {
  const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
  return response.data.data!;
};

export const markAllAsRead = async (): Promise<{ count: number }> => {
  const response = await api.put<ApiResponse<{ count: number }>>('/notifications/read-all');
  return response.data.data!;
};
