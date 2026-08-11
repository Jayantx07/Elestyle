import { apiClient } from '@/lib/apiClient';
export interface AdminOrder {
  _id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  items?: Array<{
    product: { name: string; price: number };
    quantity: number;
    price: number;
  }>;
  subtotal?: number;
  shippingCharge?: number;
  totalAmount: number;
  status: 'pending_payment' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'payment_failed' | 'refund_pending' | 'refunded' | 'partially_refunded';
  shippingInfo?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  date: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export const adminOrderService = {
  getOrders: async (): Promise<AdminOrder[]> => {
    const res = await apiClient('/api/v1/admin/orders');
    return res.data;
  },
  
  getOrderById: async (id: string): Promise<AdminOrder> => {
    const res = await apiClient(`/api/v1/admin/orders/${id}`);
    return res.data;
  },

  updateOrderStatus: async (id: string, payload: { status?: AdminOrder['status'], shippingInfo?: AdminOrder['shippingInfo'] }): Promise<AdminOrder> => {
    const res = await apiClient(`/api/v1/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.data;
  }
};
