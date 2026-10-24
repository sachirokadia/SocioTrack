import api from './api';
import {
  Bill, Payment, Ledger, MemberSummary,
  CreateBillRequest, CreatePaymentRequest, ApiResponse,
} from '../types';

const list = async <T>(url: string, params?: Record<string, unknown>): Promise<{ items: T[]; pagination: unknown }> => {
  const response = await api.get<ApiResponse<T[]>>(url, { params });
  return { items: response.data.data || [], pagination: response.data.pagination };
};

export const getMemberSummary = async (residentId?: string): Promise<MemberSummary> => {
  const response = await api.get<ApiResponse<MemberSummary>>('/billing/summary', {
    params: residentId ? { residentId } : undefined,
  });
  return response.data.data!;
};

export const getLedger = async (residentId?: string): Promise<Ledger> => {
  const response = await api.get<ApiResponse<Ledger>>('/billing/ledger', {
    params: residentId ? { residentId } : undefined,
  });
  return response.data.data!;
};

export const getBills = async (params?: Record<string, unknown>): Promise<Bill[]> => {
  const { items } = await list<Bill>('/billing/bills', params);
  return items;
};

export const getBillById = async (id: string): Promise<Bill> => {
  const response = await api.get<ApiResponse<Bill>>(`/billing/bills/${id}`);
  return response.data.data!;
};

export const createBill = async (data: CreateBillRequest): Promise<Bill> => {
  const response = await api.post<ApiResponse<Bill>>('/billing/bills', data);
  return response.data.data!;
};

export const getPayments = async (params?: Record<string, unknown>): Promise<Payment[]> => {
  const { items } = await list<Payment>('/billing/payments', params);
  return items;
};

export const createPayment = async (data: CreatePaymentRequest): Promise<Payment> => {
  const response = await api.post<ApiResponse<Payment>>('/billing/payments', data);
  return response.data.data!;
};

export const verifyPayment = async (id: string, status: 'verified' | 'rejected'): Promise<Payment> => {
  const response = await api.put<ApiResponse<Payment>>(`/billing/payments/${id}/verify`, { status });
  return response.data.data!;
};
