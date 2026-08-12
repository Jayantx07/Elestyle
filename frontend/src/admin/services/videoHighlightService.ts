import { apiClient } from '@/lib/apiClient';
import { getApiToken } from '@/lib/tokenManager';
import type { AdminCategory } from './categoryService';

export interface AdminVideoHighlight {
  id: string;
  _id: string;
  title: string;
  videoUrl: string;
  videoPublicId: string;
  posterUrl: string;
  displayOrder: number;
  isActive: boolean;
  category: AdminCategory | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoHighlightFormData {
  title: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
  videoFile?: File;
}

export interface ReorderItem {
  _id: string;
  displayOrder: number;
}

export const adminVideoHighlightService = {
  getAll: async (): Promise<AdminVideoHighlight[]> => {
    const res = await apiClient<{ success: boolean; data: AdminVideoHighlight[] }>('/api/v1/admin/video-highlights');
    return res.data;
  },

  getById: async (id: string): Promise<AdminVideoHighlight> => {
    const res = await apiClient<{ success: boolean; data: AdminVideoHighlight }>(`/api/v1/admin/video-highlights/${id}`);
    return res.data;
  },

  create: async (data: VideoHighlightFormData, onProgress?: (progress: number) => void): Promise<AdminVideoHighlight> => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.category) formData.append('category', data.category);
    formData.append('displayOrder', data.displayOrder.toString());
    formData.append('isActive', data.isActive.toString());
    
    if (data.videoFile) {
      formData.append('video', data.videoFile);
    }

    // Since apiClient doesn't support progress out of the box easily, we use XMLHttpRequest for upload progress
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
      
      xhr.open('POST', '/api/v1/admin/video-highlights');
      const token = getApiToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  },

  update: async (id: string, data: VideoHighlightFormData, onProgress?: (progress: number) => void): Promise<AdminVideoHighlight> => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.category !== undefined) formData.append('category', data.category);
    formData.append('displayOrder', data.displayOrder.toString());
    formData.append('isActive', data.isActive.toString());
    
    if (data.videoFile) {
      formData.append('video', data.videoFile);
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
      
      xhr.open('PUT', `/api/v1/admin/video-highlights/${id}`);
      const token = getApiToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  },

  updateStatus: async (id: string, isActive: boolean): Promise<AdminVideoHighlight> => {
    const res = await apiClient<{ success: boolean; data: AdminVideoHighlight }>(`/api/v1/admin/video-highlights/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    return res.data;
  },

  reorder: async (items: ReorderItem[]): Promise<void> => {
    await apiClient('/api/v1/admin/video-highlights/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiClient(`/api/v1/admin/video-highlights/${id}`, {
      method: 'DELETE'
    });
  }
};
