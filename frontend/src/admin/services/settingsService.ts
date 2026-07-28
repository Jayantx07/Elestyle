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
    const res = await fetch('/api/v1/admin/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    const json = await res.json();
    return json.data;
  },

  updateSettings: async (settingsData: AdminSettings): Promise<AdminSettings> => {
    const res = await fetch('/api/v1/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    const json = await res.json();
    return json.data;
  }
};
