import { apiClient } from '@/lib/apiClient';
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

export interface PublicProduct {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  category: any;
  subCategory?: any;
  price: number;
  compareAtPrice?: number;
  discount: number;
  variants?: ProductVariant[];
  colors?: { name: string; hex: string }[];
  material?: string;
  ratingAverage: number;
  reviewCount: number;
  images: { secure_url: string; alt?: string; isFeatured: boolean }[];
  featured: boolean;
}

export interface ProductQueryParams {
  category?: string;
  tag?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pages: number;
}


export const publicProductService = {
  getProducts: async (params: ProductQueryParams = {}): Promise<PaginatedResponse<PublicProduct>> => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.featured) queryParams.append('featured', String(params.featured));
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.sort) queryParams.append('sort', params.sort);

    const queryString = queryParams.toString();
    const url = `/api/v1/products${queryString ? `?${queryString}` : ''}`;

    const res = await apiClient(url);
    return res;
  },

  getProductBySlug: async (slug: string) => {
    const res = await apiClient(`/api/v1/products/${slug}`);
    return res;
  },

  getFeaturedProducts: async () => {
    const res = await apiClient('/api/v1/products/featured');
    return res;
  },

  getLatestProducts: async () => {
    const res = await apiClient('/api/v1/products/latest');
    return res;
  },

  getRelatedProducts: async (slug: string) => {
    const res = await apiClient(`/api/v1/products/related/${slug}`);
    return res;
  },

  getProductsByCategorySlug: async (slug: string, queryString: string = ''): Promise<PaginatedResponse<PublicProduct>> => {
    const url = `/api/v1/categories/${slug}/products${queryString ? (queryString.startsWith('?') ? queryString : `?${queryString}`) : ''}`;
    const res = await apiClient(url);
    return res;
  },

  getProductFacets: async (categorySlug?: string, queryString?: string) => {
    const params = new URLSearchParams(queryString || '');
    if (categorySlug && !params.has('category')) params.append('category', categorySlug);
    const res = await apiClient(`/api/v1/products/facets?${params.toString()}`);
    const json = res;
    return json.data || {};
  },

  getProductReviews: async (productId: string) => {
    const res = await apiClient(`/api/v1/products/${productId}/reviews`);
    return res;
  },

  getHighlightedReviews: async () => {
    const res = await apiClient('/api/v1/reviews/highlighted');
    return res;
  },

  voteReview: async (reviewId: string, type: 'like' | 'dislike') => {
    const res = await apiClient(`/api/v1/reviews/${reviewId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    return res;
  },
};
