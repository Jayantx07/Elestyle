import { apiClient } from '@/lib/apiClient';

export interface AdminLandingBannerCategory {
  _id: string;
  id?: string;
  name: string;
  slug: string;
}

export interface AdminLandingBanner {
  _id: string;
  id?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imagePublicId: string;
  displayOrder: number;
  isActive: boolean;
  category: AdminLandingBannerCategory | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LandingBannerPayload {
  title: string;
  subtitle?: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  imageFile?: File | null;
}

const buildFormData = (payload: LandingBannerPayload) => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('subtitle', payload.subtitle || '');
  formData.append('category', payload.category);
  formData.append('displayOrder', String(payload.displayOrder));
  formData.append('isActive', String(payload.isActive));
  if (payload.imageFile) {
    formData.append('image', payload.imageFile);
  }
  return formData;
};

export const adminLandingBannerService = {
  getLandingBanners: async (accessToken: string): Promise<AdminLandingBanner[]> => {
    const response = await apiClient<{ success: boolean; data: AdminLandingBanner[] }>('/api/v1/admin/landing-banners', {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    return response.data || [];
  },

  getLandingBannerById: async (id: string, accessToken: string): Promise<AdminLandingBanner> => {
    const response = await apiClient<{ success: boolean; data: AdminLandingBanner }>(`/api/v1/admin/landing-banners/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    return response.data;
  },

  createLandingBanner: async (payload: LandingBannerPayload, accessToken: string): Promise<AdminLandingBanner> => {
    const response = await apiClient<{ success: boolean; data: AdminLandingBanner }>('/api/v1/admin/landing-banners', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: buildFormData(payload),
    });
    return response.data;
  },

  updateLandingBanner: async (id: string, payload: LandingBannerPayload, accessToken: string): Promise<AdminLandingBanner> => {
    const response = await apiClient<{ success: boolean; data: AdminLandingBanner }>(`/api/v1/admin/landing-banners/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: buildFormData(payload),
    });
    return response.data;
  },

  updateLandingBannerStatus: async (id: string, isActive: boolean, accessToken: string): Promise<AdminLandingBanner> => {
    const response = await apiClient<{ success: boolean; data: AdminLandingBanner }>(`/api/v1/admin/landing-banners/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ isActive }),
    });
    return response.data;
  },

  reorderLandingBanners: async (items: { _id: string; displayOrder: number }[], accessToken: string): Promise<void> => {
    await apiClient('/api/v1/admin/landing-banners/reorder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ items }),
    });
  },

  deleteLandingBanner: async (id: string, accessToken: string): Promise<void> => {
    await apiClient(`/api/v1/admin/landing-banners/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
};