import type { ImageMetadata } from '../components/shared/ImageUpload';

export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: ImageMetadata;
}

export const adminCategoryService = {
  getCategories: async (): Promise<AdminCategory[]> => {
    const res = await fetch('/api/v1/admin/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    const json = await res.json();
    return json.data;
  },
  
  getCategoryById: async (id: string): Promise<AdminCategory> => {
    const res = await fetch(`/api/v1/admin/categories/${id}`);
    if (!res.ok) throw new Error('Failed to fetch category');
    const json = await res.json();
    return json.data;
  },

  createCategory: async (categoryData: Partial<AdminCategory>): Promise<AdminCategory> => {
    const res = await fetch('/api/v1/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Failed to create category');
    const json = await res.json();
    return json.data;
  },

  updateCategory: async (id: string, categoryData: Partial<AdminCategory>): Promise<AdminCategory> => {
    const res = await fetch(`/api/v1/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
    if (!res.ok) throw new Error('Failed to update category');
    const json = await res.json();
    return json.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    const res = await fetch(`/api/v1/admin/categories/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete category');
  }
};
