import apiClient from './client';
import type { Product, ProductFormData, StockMovement } from '../types/product';

export const productApi = {
  getAll: async (params?: { search?: string; category?: string }): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (data: ProductFormData): Promise<{ message: string; productId: number }> => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<ProductFormData & { reason?: string }>): Promise<{ message: string }> => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  addMovement: async (
    id: number,
    data: { quantity_changed: number; movement_type: 'IN' | 'OUT'; reason: string }
  ): Promise<{ message: string; new_stock: number }> => {
    const response = await apiClient.post(`/products/${id}/movements`, data);
    return response.data;
  },

  getMovements: async (id: number): Promise<StockMovement[]> => {
    const response = await apiClient.get<StockMovement[]>(`/products/${id}/movements`);
    return response.data;
  },
};
