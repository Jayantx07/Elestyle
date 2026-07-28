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
    const res = await fetch('/api/v1/admin/coupons');
    if (!res.ok) throw new Error('Failed to fetch coupons');
    const json = await res.json();
    return json.data;
  },

  getCouponById: async (id: string): Promise<AdminCoupon> => {
    const res = await fetch(`/api/v1/admin/coupons/${id}`);
    if (!res.ok) throw new Error('Failed to fetch coupon details');
    const json = await res.json();
    return json.data;
  },

  createCoupon: async (couponData: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const res = await fetch('/api/v1/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    if (!res.ok) throw new Error('Failed to create coupon');
    const json = await res.json();
    return json.data;
  },

  updateCoupon: async (id: string, couponData: Partial<AdminCoupon>): Promise<AdminCoupon> => {
    const res = await fetch(`/api/v1/admin/coupons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData)
    });
    if (!res.ok) throw new Error('Failed to update coupon');
    const json = await res.json();
    return json.data;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    const res = await fetch(`/api/v1/admin/coupons/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
  }
};
