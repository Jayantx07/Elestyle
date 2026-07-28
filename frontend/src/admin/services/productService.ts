import type { ImageMetadata } from '../components/shared/ImageUpload';

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  discount: number;
  stock: number;
  tags: string[];
  status: 'active' | 'inactive';
  images: ImageMetadata[];
  featured: boolean;
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
    if (!res.ok) throw new Error('Failed to create product');
    const json = await res.json();
    return json.data;
  },

  updateProduct: async (id: string, productData: Partial<AdminProduct>): Promise<AdminProduct> => {
    const res = await fetch(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to update product');
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
