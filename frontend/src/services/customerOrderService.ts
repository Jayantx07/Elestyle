import { apiClient } from '@/lib/apiClient';

export interface CustomerOrder {
  _id: string;
  customer: string;
  items: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
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
  createdAt: string;
}

export const customerOrderService = {
  getMyOrders: async (): Promise<{ success: boolean; data: CustomerOrder[] }> => {
    const res = await apiClient('/api/v1/orders/my-orders');
    return res;
  },
};
