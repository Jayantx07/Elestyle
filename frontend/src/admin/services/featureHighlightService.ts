import { apiClient } from '@/lib/apiClient';
import { getApiToken } from '@/lib/tokenManager';
import type { AdminCategory } from './categoryService';

export interface AdminFeatureHighlight {
  id: string;
  _id: string;
  altText: string;
  imageSrc: string;
  imagePublicId: string;
  displayOrder: number;
  isActive: boolean;
  category: AdminCategory | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureHighlightFormData {
  altText: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  imageFile?: File;
}

export interface ReorderItem {
  _id: string;
  displayOrder: number;
}

export const adminFeatureHighlightService = {
  getAll: async (): Promise<AdminFeatureHighlight[]> => {
    const res = await apiClient<{ success: boolean; data: AdminFeatureHighlight[] }>('/api/v1/admin/feature-highlights');
    return res.data;
  },

  getById: async (id: string): Promise<AdminFeatureHighlight> => {
    const res = await apiClient<{ success: boolean; data: AdminFeatureHighlight }>(`/api/v1/admin/feature-highlights/${id}`);
    return res.data;
  },

  create: async (data: FeatureHighlightFormData, onProgress?: (progress: number) => void): Promise<AdminFeatureHighlight> => {
    const formData = new FormData();
    if (data.altText) formData.append('altText', data.altText);
    if (data.category) formData.append('category', data.category);
    formData.append('displayOrder', data.displayOrder.toString());
    formData.append('isActive', data.isActive.toString());
    
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response.data);
          } else {
            reject(new Error(response.message || 'Upload failed'));
          }
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      
      xhr.open('POST', '/api/v1/admin/feature-highlights');
      const token = getApiToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  },

  update: async (id: string, data: FeatureHighlightFormData, onProgress?: (progress: number) => void): Promise<AdminFeatureHighlight> => {
    const formData = new FormData();
    if (data.altText !== undefined) formData.append('altText', data.altText);
    if (data.category !== undefined) formData.append('category', data.category);
    formData.append('displayOrder', data.displayOrder.toString());
    formData.append('isActive', data.isActive.toString());
    
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response.data);
          } else {
            reject(new Error(response.message || 'Upload failed'));
          }
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      
      xhr.open('PUT', `/api/v1/admin/feature-highlights/${id}`);
      const token = getApiToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  },

  updateStatus: async (id: string, isActive: boolean): Promise<AdminFeatureHighlight> => {
    const res = await apiClient<{ success: boolean; data: AdminFeatureHighlight }>(`/api/v1/admin/feature-highlights/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    return res.data;
  },

  reorder: async (items: ReorderItem[]): Promise<void> => {
    await apiClient('/api/v1/admin/feature-highlights/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient(`/api/v1/admin/feature-highlights/${id}`, {
      method: 'DELETE'
    });
  }
};
