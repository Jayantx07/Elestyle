const API_URL = '/api/v1/auth';

export const authService = {
  async signup(data: any) {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async googleAuth(credential: string) {
    const res = await fetch(`${API_URL}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    return res.json();
  },

  async verifyEmail(token: string) {
    const res = await fetch(`${API_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(data: any) {
    const res = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async logout() {
    const res = await fetch(`${API_URL}/logout`, { method: 'POST' });
    return res.json();
  },

  async getMe(accessToken: string) {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json();
  },

  async refreshToken() {
    const res = await fetch(`${API_URL}/refresh-token`, { method: 'POST' });
    return res.json();
  },
};
