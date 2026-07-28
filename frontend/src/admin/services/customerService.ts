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
    const res = await fetch('/api/v1/admin/customers');
    if (!res.ok) throw new Error('Failed to fetch customers');
    const json = await res.json();
    return json.data;
  },
  
  getCustomerById: async (id: string): Promise<AdminCustomer> => {
    const res = await fetch(`/api/v1/admin/customers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch customer details');
    const json = await res.json();
    return json.data;
  },

  updateCustomerStatus: async (id: string, status: 'Active' | 'Blocked'): Promise<AdminCustomer> => {
    const res = await fetch(`/api/v1/admin/customers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update customer status');
    const json = await res.json();
    return json.data;
  }
};
