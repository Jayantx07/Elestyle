import { apiClient } from '@/lib/apiClient';
export interface AdminOrder {
  _id: string;
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
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
}

export const adminOrderService = {
  getOrders: async (): Promise<AdminOrder[]> => {
    const res = await apiClient('/api/v1/admin/orders');
    const json = res;
    return json.data;
  },
  
  getOrderById: async (id: string): Promise<AdminOrder> => {
    const res = await apiClient(`/api/v1/admin/orders/${id}`);
    const json = res;
    return json.data;
  },

  updateOrderStatus: async (id: string, status: AdminOrder['status']): Promise<AdminOrder> => {
    const res = await apiClient(`/api/v1/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = res;
    return json.data;
  }
};
