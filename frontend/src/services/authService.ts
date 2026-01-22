import api from './api';
import { LoginFormData, RegisterApiData } from '../types';

export const authService = {
  async login(credentials: LoginFormData) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterApiData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/password/forgot', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/password/reset', { token, password });
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await api.get(`/auth/verify?token=${token}`);
    return response.data;
  },
};
