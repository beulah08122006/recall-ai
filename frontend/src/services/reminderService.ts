import { api } from './api';
import { Reminder, ReminderStatus, ReminderPriority } from '../types';

export const reminderService = {
  async getReminders(params?: { status?: ReminderStatus; priority?: ReminderPriority; search?: string }): Promise<Reminder[]> {
    const res = await api.get('/reminders', { params });
    return res.data.reminders;
  },

  async getUpcoming(): Promise<Reminder[]> {
    const res = await api.get('/reminders/upcoming');
    return res.data.reminders;
  },

  async createReminder(data: Partial<Reminder>): Promise<Reminder> {
    const res = await api.post('/reminders', data);
    return res.data.reminder;
  },

  async updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder> {
    const res = await api.put(`/reminders/${id}`, data);
    return res.data.reminder;
  },

  async toggleComplete(id: string): Promise<Reminder> {
    const res = await api.patch(`/reminders/${id}/toggle`);
    return res.data.reminder;
  },

  async deleteReminder(id: string): Promise<void> {
    await api.delete(`/reminders/${id}`);
  },
};

