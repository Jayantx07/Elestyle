import { apiClient } from '@/lib/apiClient';
export interface AdminCoupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  expiryDate: string;
  status: 'Active' | 'Expired';
}

export const adminCouponService = {
  getCoupons: async (): Promise<AdminCoupon[]> => {
    const res = await apiClient('/api/v1/admin/coupons');
    const json = res;
    return json.data;
  },

  getCouponById: async (id: string): Promise<AdminCoupon> => {
    const res = await apiClient(`/api/v1/admin/coupons/${id}`);
    const json = res;
    return json.data;
  },

  createCoupon: async (couponData: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const res = await apiClient('/api/v1/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    const json = res;
    return json.data;
  },

  updateCoupon: async (id: string, couponData: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const res = await apiClient(`/api/v1/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    const json = res;
    return json.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    const res = await apiClient(`/api/v1/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  }
};
