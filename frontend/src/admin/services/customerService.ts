import { apiClient } from '@/lib/apiClient';
export interface AdminCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Blocked';
  joinedAt: string;
  addresses?: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  recentOrders?: Array<{
    _id: string;
    date: string;
    totalAmount: number;
    status: string;
  }>;
}

export const adminCustomerService = {
  getCustomers: async (): Promise<AdminCustomer[]> => {
    const res = await apiClient('/api/v1/admin/customers');
    const json = res;
    return json.data;
  },
  
  getCustomerById: async (id: string): Promise<AdminCustomer> => {
    const res = await apiClient(`/api/v1/admin/customers/${id}`);
    const json = res;
    return json.data;
  },

  updateCustomerStatus: async (id: string, status: 'Active' | 'Blocked'): Promise<AdminCustomer> => {
    const res = await apiClient(`/api/v1/admin/customers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = res;
    return json.data;
  }
};
