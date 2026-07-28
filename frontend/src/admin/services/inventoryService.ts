export interface AdminInventoryItem {
  _id: string;
  product: { _id: string; name: string; slug: string };
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export const adminInventoryService = {
  getInventory: async (): Promise<AdminInventoryItem[]> => {
    const res = await fetch('/api/v1/admin/inventory');
    if (!res.ok) throw new Error('Failed to fetch inventory');
    const json = await res.json();
    return json.data;
  },

  updateStock: async (id: string, stock: number): Promise<AdminInventoryItem> => {
    const res = await fetch(`/api/v1/admin/inventory/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    });
    if (!res.ok) throw new Error('Failed to update stock');
    const json = await res.json();
    return json.data;
  }
};
