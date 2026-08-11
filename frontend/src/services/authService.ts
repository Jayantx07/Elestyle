import { apiClient } from '@/lib/apiClient';
const API_URL = '/api/v1/auth';

export const authService = {
  async signup(data: any) {
    const res = await apiClient(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res;
  },

  async login(data: any) {
    const res = await apiClient(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res;
  },

  async googleAuth(credential: string) {
    const res = await apiClient(`${API_URL}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    return res;
  },

  async verifyEmail(token: string) {
    const res = await apiClient(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return res;
  },

  async resendVerification(email: string) {
    const res = await apiClient(`${API_URL}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res;
  },

  async updateProfile(data: { name?: string; phone?: string }, token: string) {
    const res = await apiClient(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res;
  },

  async updateAddresses(addresses: any[], token: string) {
    const res = await apiClient(`${API_URL}/addresses`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ addresses }),
    });
    return res;
  },

  async uploadAvatar(file: File, token: string) {
    const formData = new FormData();
    formData.append('avatar', file);

    const res = await apiClient(`${API_URL}/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return res;
  },

  async forgotPassword(email: string) {
    const res = await apiClient(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res;
  },

  async resetPassword(data: any) {
    const res = await apiClient(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res;
  },

  async logout() {
    const res = await apiClient(`${API_URL}/logout`, { method: 'POST' });
    return res;
  },

  async getMe(accessToken: string) {
    const res = await apiClient(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res;
  },

  async refreshToken() {
    const res = await apiClient(`${API_URL}/refresh-token`, { method: 'POST' });
    return res;
  },
};
