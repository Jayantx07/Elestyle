import type { ImageMetadata } from '../components/shared/ImageUpload';

export interface ProductVariant {
  _id?: string;
  name: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  colorName?: string;
  colorHex?: string;
  material?: string;
  image?: string;
  images?: { secure_url: string; public_id?: string; isPrimary?: boolean }[];
  sizes?: string[];
  isAvailable?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  category: { _id: string; name: string; slug: string } | string;
  subCategory?: { _id: string; name: string; slug: string } | string;
  legacySubCategory?: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  discount: number;
  stock: number;
  variants?: ProductVariant[];
  colors?: { name: string; hex: string }[];
  material?: string;
  weight?: string;
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  brand?: string;
  handmadeTime?: string;
  availability?: 'In Stock' | 'Pre-Order' | 'Out of Stock';
  countryOfOrigin?: string;
  attributes?: { key: string; label: string; value: any; type: 'String' | 'Number' | 'Boolean' | 'Date' }[];
  tags?: string[];
  searchKeywords?: string[];
  status: 'active' | 'inactive';
  visibility?: 'public' | 'hidden';
  images: ImageMetadata[];
  featured: boolean;
  schemaVersion?: number;
}

export const adminProductService = {
  getProducts: async (): Promise<AdminProduct[]> => {
    const res = await fetch('/api/v1/admin/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    const json = await res.json();
    return json.data;
  },
  
  getProductById: async (id: string): Promise<AdminProduct> => {
    const res = await fetch(`/api/v1/admin/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    const json = await res.json();
    return json.data;
  },

  createProduct: async (productData: Partial<AdminProduct>): Promise<AdminProduct> => {
    const res = await fetch('/api/v1/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create product');
    }
    const json = await res.json();
    return json.data;
  },

  updateProduct: async (id: string, productData: Partial<AdminProduct>): Promise<AdminProduct> => {
    const res = await fetch(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update product');
    }
    const json = await res.json();
    return json.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await fetch(`/api/v1/admin/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
  }
};
