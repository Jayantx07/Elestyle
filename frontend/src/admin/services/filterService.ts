import { apiClient } from '@/lib/apiClient';
export interface AdminFilterConfiguration {
  _id: string;
  name: string;
  key: string;
  type: 'Checkbox' | 'Radio' | 'Color Swatch' | 'Price Range' | 'Rating' | 'Availability' | 'Numeric Range';
  displayOrder: number;
  enabled: boolean;
  visible: boolean;
  values: any[];
  sortOrder: 'Alphabetical' | 'Count High -> Low' | 'Manual';
  defaultExpanded: boolean;
  showProductCounts: boolean;
  featuredFilter: boolean;
  category?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const adminFilterService = {
  getFilters: async (category?: string): Promise<AdminFilterConfiguration[]> => {
    const url = category ? `/api/v1/admin/filters?category=${category}` : '/api/v1/admin/filters';
    const response = await apiClient(url);
    const data = response;
    return data.data || [];
  },

  getFilterById: async (id: string): Promise<AdminFilterConfiguration> => {
    const response = await apiClient(`/api/v1/admin/filters/${id}`);
    const data = response;
    return data.data;
  },

  createFilter: async (payload: Partial<AdminFilterConfiguration>): Promise<AdminFilterConfiguration> => {
    const response = await apiClient('/api/v1/admin/filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = response;
    return data.data;
  },

  updateFilter: async (id: string, payload: Partial<AdminFilterConfiguration>): Promise<AdminFilterConfiguration> => {
    const response = await apiClient(`/api/v1/admin/filters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = response;
    return data.data;
  },

  deleteFilter: async (id: string): Promise<void> => {
    const response = await apiClient(`/api/v1/admin/filters/${id}`, {
      method: 'DELETE',
    });
    const data = response;
  },

  reorderFilters: async (items: { _id: string; displayOrder: number }[]): Promise<void> => {
    const response = await apiClient('/api/v1/admin/filters/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  },
};
