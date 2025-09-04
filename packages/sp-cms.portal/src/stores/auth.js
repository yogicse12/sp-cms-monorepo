import { defineStore } from 'pinia';
import api from '@/services/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: state => !!state.token,
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post('/api/auth/login', credentials);
        const { token, user } = response.data;
        this.token = token;
        this.user = user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return response;
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    async changePassword(passwordData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.put('/api/auth/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Password change failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
