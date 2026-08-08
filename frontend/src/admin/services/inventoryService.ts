import { apiClient } from '@/lib/apiClient';
export interface AdminInventoryItem {
  _id: string;
  product: { _id: string; name: string; slug: string };
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export const adminInventoryService = {
  getInventory: async (): Promise<AdminInventoryItem[]> => {
    const res = await apiClient('/api/v1/admin/inventory');
    const json = res;
    return json.data;
  },

  updateStock: async (id: string, stock: number): Promise<AdminInventoryItem> => {
    const res = await apiClient(`/api/v1/admin/inventory/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    });
    const json = res;
    return json.data;
  }
};
