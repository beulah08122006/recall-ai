import { api } from './api';
import { Memory } from '../types';

export const memoryService = {
  async getMemories(params?: { search?: string; category?: string; tag?: string }): Promise<Memory[]> {
    const res = await api.get('/memories', { params });
    return res.data.memories;
  },

  async getMemory(id: string): Promise<Memory> {
    const res = await api.get(`/memories/${id}`);
    return res.data.memory;
  },

  async createMemory(data: Partial<Memory>): Promise<Memory> {
    const res = await api.post('/memories', data);
    return res.data.memory;
  },

  async updateMemory(id: string, data: Partial<Memory>): Promise<Memory> {
    const res = await api.put(`/memories/${id}`, data);
    return res.data.memory;
  },

  async deleteMemory(id: string): Promise<void> {
    await api.delete(`/memories/${id}`);
  },
};

