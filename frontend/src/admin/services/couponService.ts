import { apiClient } from '@/lib/apiClient';

export interface AdminCoupon {
  _id: string;
  code: string;
  title?: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  maxDiscountAmount: number;
  minPurchaseAmount: number;
  applicableCategories: string[];
  applicableProducts: string[];
  excludedCategories: string[];
  excludedProducts: string[];
  customerEligibility: string[];
  allowGuest: boolean;
  maxUsageLimit: number | null;
  currentUsageCount: number;
  perCustomerUsageLimit: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  status: 'Active' | 'Expired';
  priority: number;
  stackable: boolean;
  autoApply: boolean;
}

export const adminCouponService = {
  getCoupons: async (): Promise<AdminCoupon[]> => {
    const res = await apiClient('/api/v1/admin/coupons');
    return res.data;
  },

  getCouponById: async (id: string): Promise<AdminCoupon> => {
    const res = await apiClient(`/api/v1/admin/coupons/${id}`);
    return res.data;
  },

  createCoupon: async (couponData: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const res = await apiClient('/api/v1/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    return res.data;
  },

  updateCoupon: async (id: string, couponData: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const res = await apiClient(`/api/v1/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    return res.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await apiClient(`/api/v1/admin/coupons/${id}`, {
      method: 'DELETE'
    });
  }
};
