export interface StorefrontFilterConfig {
  _id: string;
  name: string;
  key: string;
  type: 'Checkbox' | 'Radio' | 'Color Swatch' | 'Price Range' | 'Rating' | 'Availability' | 'Numeric Range';
  values?: { label: string; value: any; productCount?: number }[];
  displayOrder: number;
  enabled: boolean;
  visible: boolean;
  sortOrder?: string;
  defaultExpanded?: boolean;
  showProductCounts?: boolean;
}

export interface FacetsData {
  colors: { name: string; hex: string; count: number }[];
  materials: { name: string; count: number }[];
  priceMin: number;
  priceMax: number;
  subCategories: { _id: string; count: number; legacy?: string }[];
  availability: { status: string; count: number }[];
}

export const publicFilterService = {
  getFilterConfigs: async (categorySlug?: string): Promise<StorefrontFilterConfig[]> => {
    const url = `/api/v1/filters${categorySlug ? `?category=${categorySlug}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch filter configurations');
    const json = await res.json();
    return (json.data || []).filter((f: StorefrontFilterConfig) => f.enabled && f.visible);
  },
};
