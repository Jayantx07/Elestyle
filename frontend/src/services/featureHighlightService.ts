import { apiClient } from '@/lib/apiClient';

export interface PublicFeatureHighlight {
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

export const publicFeatureHighlightService = {
  getAll: async (): Promise<PublicFeatureHighlight[]> => {
    const res = await apiClient<{ success: boolean; data: PublicFeatureHighlight[] }>('/api/v1/feature-highlights');
    return res.data;
  },
};
