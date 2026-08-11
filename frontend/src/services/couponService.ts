import { apiClient } from '@/lib/apiClient';

const API_URL = '/api/v1/coupons';

export const couponService = {
  async getAvailableCoupons(token: string) {
    const res = await apiClient(`${API_URL}/available`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res;
  },
};
