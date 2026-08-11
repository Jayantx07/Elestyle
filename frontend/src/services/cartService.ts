import { apiClient } from '@/lib/apiClient';
const API_URL = '/api/v1/cart';

export const cartService = {
  async getCart(accessToken: string) {
    const res = await apiClient(`${API_URL}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res;
  },

  async addToCart(data: { productId: string; quantity?: number; price?: number }, accessToken: string) {
    const res = await apiClient(`${API_URL}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });
    return res;
  },

  async updateQuantity(productId: string, quantity: number, accessToken: string) {
    const res = await apiClient(`${API_URL}/${productId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ quantity }),
    });
    return res;
  },

  async removeFromCart(productId: string, accessToken: string) {
    const res = await apiClient(`${API_URL}/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res;
  },

  async clearCart(accessToken: string) {
    const res = await apiClient(`${API_URL}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res;
  },

  async mergeCart(localItems: { id: string; quantity: number; price: number }[], accessToken: string) {
    const res = await apiClient(`${API_URL}/merge`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ localItems }),
    });
    return res;
  },

  async validateCoupon(code: string, items: { productId: string; quantity: number }[], accessToken?: string | null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const res = await apiClient('/api/v1/coupons/validate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, items }),
    });
    return res;
  }
};
