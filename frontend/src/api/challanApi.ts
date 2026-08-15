import apiClient from './client';
import type { Challan, ChallanDetail, ChallanStatus, CreateChallanPayload } from '../types/challan';

export const challanApi = {
  getAll: async (params?: { status?: string }): Promise<Challan[]> => {
    const response = await apiClient.get<Challan[]>('/challans', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ChallanDetail> => {
    const response = await apiClient.get<ChallanDetail>(`/challans/${id}`);
    return response.data;
  },

  create: async (payload: CreateChallanPayload): Promise<{ challanId: number; challanNumber: string }> => {
    const response = await apiClient.post('/challans', payload);
    return response.data;
  },

  updateStatus: async (id: number, status: ChallanStatus): Promise<{ message: string }> => {
    const response = await apiClient.put(`/challans/${id}/status`, { status });
    return response.data;
  },

  getInvoiceUrl: (id: number): string => {
    const token = localStorage.getItem('token');
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/challans/${id}/invoice?token=${token}`;
  },
};
