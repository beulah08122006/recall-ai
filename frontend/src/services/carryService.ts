import { api } from './api';
import { CarryItem } from '../types';

export const carryService = {
  async getItems(): Promise<CarryItem[]> {
    const res = await api.get('/carry');
    return res.data.items;
  },

  async createItem(data: { name: string; description?: string; category?: string }): Promise<CarryItem> {
    const res = await api.post('/carry', data);
    return res.data.item;
  },

  async updateItem(id: string, data: Partial<CarryItem>): Promise<CarryItem> {
    const res = await api.put(`/carry/${id}`, data);
    return res.data.item;
  },

  async toggleChecked(id: string): Promise<CarryItem> {
    const res = await api.patch(`/carry/${id}/toggle`);
    return res.data.item;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/carry/${id}`);
  },

  async clearCompleted(): Promise<void> {
    await api.post('/carry/clear-completed');
  },
};

