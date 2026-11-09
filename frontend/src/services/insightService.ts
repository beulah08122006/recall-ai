import { api } from './api';
import { InsightsData } from '../types';

export const insightService = {
  async getInsights(): Promise<InsightsData> {
    const res = await api.get('/insights');
    return res.data;
  },
};

