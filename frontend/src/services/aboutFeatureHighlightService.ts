import { apiClient } from '@/lib/apiClient';

export interface PublicAboutFeatureHighlight {
  id: string;
  altText: string;
  imageSrc: string;
  displayOrder: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export const publicAboutFeatureHighlightService = {
  getAll: async (): Promise<PublicAboutFeatureHighlight[]> => {
    const res = await apiClient<{ success: boolean; data: PublicAboutFeatureHighlight[] }>('/api/v1/about-feature-highlights');
    return res.data;
  },
};
