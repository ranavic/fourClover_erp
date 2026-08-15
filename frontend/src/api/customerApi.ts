import apiClient from './client';
import type { Customer, CustomerFormData } from '../types/customer';

export const customerApi = {
  getAll: async (params?: { search?: string; status?: string; customer_type?: string }): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>('/customers', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CustomerFormData): Promise<{ message: string; customerId: number }> => {
    const response = await apiClient.post('/customers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CustomerFormData>): Promise<{ message: string }> => {
    const response = await apiClient.put(`/customers/${id}`, data);
    return response.data;
  },
};
