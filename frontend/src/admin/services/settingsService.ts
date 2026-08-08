import { apiClient } from '@/lib/apiClient';
export interface AdminSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  taxRate: number;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  currency: string;
}

export const adminSettingsService = {
  getSettings: async (): Promise<AdminSettings> => {
    const res = await apiClient('/api/v1/admin/settings');
    const json = res;
    return json.data;
  },

  updateSettings: async (settingsData: AdminSettings): Promise<AdminSettings> => {
    const res = await apiClient('/api/v1/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });
    const json = res;
    return json.data;
  }
};
