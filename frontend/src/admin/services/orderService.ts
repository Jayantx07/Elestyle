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
    const res = await fetch('/api/v1/admin/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    const json = await res.json();
    return json.data;
  },
  
  getOrderById: async (id: string): Promise<AdminOrder> => {
    const res = await fetch(`/api/v1/admin/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order details');
    const json = await res.json();
    return json.data;
  },

  updateOrderStatus: async (id: string, status: AdminOrder['status']): Promise<AdminOrder> => {
    const res = await fetch(`/api/v1/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    const json = await res.json();
    return json.data;
  }
};
