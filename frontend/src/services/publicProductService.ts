export interface PublicProduct {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  category: any;
  subCategory?: string;
  price: number;
  compareAtPrice?: number;
  discount: number;
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

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  getProductBySlug: async (slug: string) => {
    const res = await fetch(`/api/v1/products/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  getFeaturedProducts: async () => {
    const res = await fetch('/api/v1/products/featured');
    if (!res.ok) throw new Error('Failed to fetch featured products');
    return res.json();
  },

  getLatestProducts: async () => {
    const res = await fetch('/api/v1/products/latest');
    if (!res.ok) throw new Error('Failed to fetch latest products');
    return res.json();
  },

  getRelatedProducts: async (slug: string) => {
    const res = await fetch(`/api/v1/products/related/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch related products');
    return res.json();
  },

  getProductsByCategorySlug: async (slug: string): Promise<PaginatedResponse<PublicProduct>> => {
    const res = await fetch(`/api/v1/categories/${slug}/products`);
    if (!res.ok) throw new Error('Failed to fetch products for category');
    return res.json();
  },

  getProductReviews: async (productId: string) => {
    const res = await fetch(`/api/v1/products/${productId}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  getHighlightedReviews: async () => {
    const res = await fetch('/api/v1/reviews/highlighted');
    if (!res.ok) throw new Error('Failed to fetch highlighted reviews');
    return res.json();
  },

  voteReview: async (reviewId: string, type: 'like' | 'dislike') => {
    const res = await fetch(`/api/v1/reviews/${reviewId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    if (!res.ok) throw new Error('Failed to vote on review');
    return res.json();
  },
};
