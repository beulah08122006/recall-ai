import { api } from './api';
import { Routine } from '../types';

export const routineService = {
  async getRoutines(): Promise<Routine[]> {
    const res = await api.get('/routines');
    return res.data.routines;
  },

  async createRoutine(data: { name: string; activity: string; destination?: string; items: string[]; notes?: string }): Promise<Routine> {
    const res = await api.post('/routines', data);
    return res.data.routine;
  },

  async updateRoutine(id: string, data: Partial<Routine>): Promise<Routine> {
    const res = await api.put(`/routines/${id}`, data);
    return res.data.routine;
  },

  async deleteRoutine(id: string): Promise<void> {
    await api.delete(`/routines/${id}`);
  },
};

