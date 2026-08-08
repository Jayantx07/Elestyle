export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  bannerImage?: string;
  icon?: string;
  displayOrder: number;
  showInNavbar: boolean;
  showInHomepage: boolean;
  showInCircularCarousel: boolean;
  showInSearch: boolean;
  seoTitle?: string;
  seoDescription?: string;
  subCategories?: string[];
}

export interface CatalogTreeProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discount?: number;
  stock?: number;
  status: string;
  visibility: string;
  displayOrder: number;
  images?: Array<any>;
}

export interface CatalogTreeSubCategory {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
  image?: string;
  icon?: string;
  productCount: number;
  products: CatalogTreeProduct[];
}

export interface CatalogTreeCategory {
  _id: string;
  name: string;
  slug: string;
  displayOrder: number;
  image?: string;
  icon?: string;
  totalProductCount: number;
  subCategories: CatalogTreeSubCategory[];
  directProducts: CatalogTreeProduct[];
}

import { apiClient } from '@/lib/apiClient';

export const adminCategoryService = {
  getCategories: async (): Promise<AdminCategory[]> => {
    const data = await apiClient<{ data: AdminCategory[] }>('/api/v1/admin/categories');
    return data.data || [];
  },
  
  getCategoryById: async (id: string): Promise<AdminCategory> => {
    const data = await apiClient<{ data: AdminCategory }>(`/api/v1/admin/categories/${id}`);
    return data.data;
  },

  getCatalogTree: async (): Promise<CatalogTreeCategory[]> => {
    const data = await apiClient<{ data: CatalogTreeCategory[] }>('/api/v1/admin/categories/tree');
    return data.data || [];
  },

  createCategory: async (categoryData: Partial<AdminCategory>): Promise<AdminCategory> => {
    const data = await apiClient<{ data: AdminCategory }>('/api/v1/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    return data.data;
  },

  updateCategory: async (id: string, categoryData: Partial<AdminCategory>): Promise<AdminCategory> => {
    const data = await apiClient<{ data: AdminCategory }>(`/api/v1/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    return data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient(`/api/v1/admin/categories/${id}`, {
      method: 'DELETE'
    });
  }
};
