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

export const adminCategoryService = {
  getCategories: async (): Promise<AdminCategory[]> => {
    const res = await fetch('/api/v1/admin/categories', { cache: 'no-store' });
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
    if (!res.ok) {
      let errorMessage = 'Failed to delete category';
      try {
        const json = await res.json();
        if (json.message) errorMessage = json.message;
      } catch (e) {
        // Ignore json parse errors
      }
      throw new Error(errorMessage);
    }
  }
};
