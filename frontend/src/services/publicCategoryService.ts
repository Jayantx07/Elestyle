import { apiClient } from '@/lib/apiClient';
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
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
  isActive: boolean;
  subCategories?: string[];
}

export const fetchPublicCategories = async (params: { navbar?: boolean, homepage?: boolean, carousel?: boolean, search?: boolean } = {}): Promise<Category[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.navbar) queryParams.append('navbar', 'true');
    if (params.homepage) queryParams.append('homepage', 'true');
    if (params.carousel) queryParams.append('carousel', 'true');
    if (params.search) queryParams.append('search', 'true');
    
    const queryString = queryParams.toString();
    const url = `/api/v1/categories${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient(url, { cache: 'no-store' });
    const result = response;
    return result.data || [];
  } catch (error) {
    console.error('Failed to fetch public categories:', error);
    return [];
  }
};
