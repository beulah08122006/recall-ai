import { api } from './api';
import { Item, ItemDirection, ItemStatus } from '../types';

export const itemService = {
  async getItems(params?: { direction?: ItemDirection; status?: ItemStatus; search?: string }): Promise<Item[]> {
    const res = await api.get('/items', { params });
    return res.data.items;
  },

  async getItem(id: string): Promise<Item> {
    const res = await api.get(`/items/${id}`);
    return res.data.item;
  },

  async createItem(data: Partial<Item>): Promise<Item> {
    const res = await api.post('/items', data);
    return res.data.item;
  },

  async updateItem(id: string, data: Partial<Item>): Promise<Item> {
    const res = await api.put(`/items/${id}`, data);
    return res.data.item;
  },

  async markReturned(id: string): Promise<Item> {
    const res = await api.patch(`/items/${id}/returned`);
    return res.data.item;
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/items/${id}`);
  },
};

