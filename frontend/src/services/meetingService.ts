import api from './api';
import { Meeting, CreateMeetingRequest, ApiResponse } from '../types';

export const getMeetings = async (params?: Record<string, unknown>): Promise<Meeting[]> => {
  const response = await api.get<ApiResponse<Meeting[]>>('/meetings', { params });
  return response.data.data || [];
};

export const createMeeting = async (data: CreateMeetingRequest): Promise<Meeting> => {
  const response = await api.post<ApiResponse<Meeting>>('/meetings', data);
  return response.data.data!;
};

export const deleteMeeting = async (id: string): Promise<void> => {
  await api.delete(`/meetings/${id}`);
};
