import { apiClient } from '@/lib/apiClient';

export interface PublicLandingBannerCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PublicLandingBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  displayOrder: number;
  category: PublicLandingBannerCategory | null;
}

export const publicLandingBannerService = {
  getLandingBanners: async (): Promise<PublicLandingBanner[]> => {
    const response = await apiClient<{ success: boolean; data: PublicLandingBanner[] }>('/api/v1/landing-banners', {
      cache: 'no-store',
    });
    return response.data || [];
  },
};