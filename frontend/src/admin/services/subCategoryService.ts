export interface AdminSubCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: { _id: string; name: string; slug: string } | string;
  image?: string;
  bannerImage?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  featured: boolean;
  showInNavbar: boolean;
  showInHomepage: boolean;
  showInCircularCarousel: boolean;
  showInSearch: boolean;
  seoTitle?: string;
  seoDescription?: string;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

import { apiClient } from '@/lib/apiClient';

export const adminSubCategoryService = {
  getSubCategories: async (params: { category?: string; search?: string; active?: boolean } = {}): Promise<AdminSubCategory[]> => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.active !== undefined) query.append('active', String(params.active));

    const data = await apiClient<{ data: AdminSubCategory[] }>(`/api/v1/admin/subcategories?${query.toString()}`);
    return data.data || [];
  },

  getSubCategoryById: async (id: string): Promise<AdminSubCategory> => {
    const data = await apiClient<{ data: AdminSubCategory }>(`/api/v1/admin/subcategories/${id}`);
    return data.data;
  },

  createSubCategory: async (payload: Partial<AdminSubCategory>): Promise<AdminSubCategory> => {
    const data = await apiClient<{ data: AdminSubCategory }>('/api/v1/admin/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  updateSubCategory: async (id: string, payload: Partial<AdminSubCategory>): Promise<AdminSubCategory> => {
    const data = await apiClient<{ data: AdminSubCategory }>(`/api/v1/admin/subcategories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return data.data;
  },

  deleteSubCategory: async (id: string): Promise<void> => {
    await apiClient(`/api/v1/admin/subcategories/${id}`, {
      method: 'DELETE',
    });
  },

  reorderSubCategories: async (items: { _id: string; displayOrder: number }[]): Promise<void> => {
    await apiClient('/api/v1/admin/subcategories/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  },
};
