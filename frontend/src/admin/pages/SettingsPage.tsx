import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { FormInput } from '../components/shared/FormFields';
import { adminSettingsService, type AdminSettings } from '../services/settingsService';

export default function SettingsPage() {
  const [formData, setFormData] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminSettingsService.getSettings();
      setFormData(data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    }
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setSaving(true);
      await adminSettingsService.updateSettings(formData);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader title="Store Settings" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Store Name"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              helperText="e.g. USD, EUR"
            />
            <FormInput
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Contact Phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <FormInput
                label="Store Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax & Shipping</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Tax Rate (%)"
              name="taxRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.taxRate}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Flat Shipping Rate"
              name="shippingFlatRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.shippingFlatRate}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Free Shipping Threshold"
              name="freeShippingThreshold"
              type="number"
              min="0"
              step="0.01"
              value={formData.freeShippingThreshold}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
