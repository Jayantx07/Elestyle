import { apiClient } from '@/lib/apiClient';

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: string[];
    sku?: string;
  };
  quantity: number;
  price: number;
}

export interface CustomerOrder {
  _id: string;
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderStatus: string;
  paymentAttempts?: any[];
  refunds?: any[];
  shippingInfo?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
  };
  statusHistory?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

export interface OrdersResponse {
  success: boolean;
  data: CustomerOrder[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export const customerOrderService = {
  getMyOrders: async (page = 1, limit = 10): Promise<OrdersResponse> => {
    const res = await apiClient(`/api/v1/orders?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return res;
  },

  getOrderDetails: async (id: string): Promise<CustomerOrder> => {
    const res = await apiClient(`/api/v1/orders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return res.data;
  },

  cancelOrder: async (id: string, reason: string) => {
    const res = await apiClient(`/api/v1/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason })
    });
    return res;
  },

  retryPayment: async (id: string, confirmPriceChange = false) => {
    const url = `/api/v1/payments/${id}/retry${confirmPriceChange ? '?confirm=true' : ''}`;
    try {
      const res = await apiClient(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res;
    } catch (error: any) {
      if (error?.code === 'PRICE_CHANGED') {
        throw error; // Throw specific object so UI can ask for confirmation
      }
      throw error;
    }
  }
};
