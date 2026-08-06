export interface PublicSubCategory {
  _id: string;
  name: string;
  slug: string;
  slugHistory?: string[];
  category: string | { _id: string; name: string; slug: string };
  description?: string;
  image?: string;
  bannerImage?: string;
  icon?: string;
  displayOrder: number;
  featured: boolean;
  isActive: boolean;
  productCount?: number;
}

export const publicSubCategoryService = {
  getSubCategories: async (params: { category?: string; featured?: boolean; carousel?: boolean; navbar?: boolean } = {}): Promise<PublicSubCategory[]> => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.featured) query.append('featured', 'true');
    if (params.carousel) query.append('carousel', 'true');
    if (params.navbar) query.append('navbar', 'true');

    const res = await fetch(`/api/v1/subcategories?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch public subcategories');
    const json = await res.json();
    return json.data || [];
  },

  getSubCategoryBySlug: async (slug: string): Promise<PublicSubCategory> => {
    const res = await fetch(`/api/v1/subcategories/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch subcategory details');
    const json = await res.json();
    return json.data;
  },
};
