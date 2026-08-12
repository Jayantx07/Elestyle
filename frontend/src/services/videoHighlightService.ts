import { apiClient } from '@/lib/apiClient';

export interface PublicVideoHighlight {
  id: string;
  title: string;
  videoUrl: string;
  posterUrl: string;
  displayOrder: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export const videoHighlightService = {
  getHighlights: async (): Promise<PublicVideoHighlight[]> => {
    const res = await apiClient<{ success: boolean; data: PublicVideoHighlight[] }>('/api/v1/video-highlights');
    return res.data;
  },
};
