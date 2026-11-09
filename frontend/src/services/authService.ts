import { api } from './api';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  async updateProfile(data: { name?: string; preferences?: any }): Promise<User> {
    const res = await api.put('/auth/profile', data);
    return res.data.user;
  },
};

