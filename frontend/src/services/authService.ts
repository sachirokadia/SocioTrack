import api from './api';
import { LoginRequest, RegisterRequest, LoginResponse, User, ApiResponse } from '../types';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  return response.data.data!;
};

export const register = async (data: RegisterRequest): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
  return response.data.data!;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/auth/me');
  return response.data.data!;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const refreshToken = async (): Promise<{ token: string }> => {
  const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh-token');
  return response.data.data!;
};
