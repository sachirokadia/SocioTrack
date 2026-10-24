import api from './api';
import { Analytics, ApiResponse, User } from '../types';

export const getAnalytics = async (): Promise<Analytics> => {
  const response = await api.get<ApiResponse<Analytics>>('/admin/analytics');
  return response.data.data!;
};

export const getUsers = async (role?: string): Promise<User[]> => {
  const response = await api.get<ApiResponse<User[]>>('/admin/users', { params: { role } });
  return response.data.data || [];
};
