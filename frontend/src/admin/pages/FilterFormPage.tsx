// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { FormInput } from '../components/shared/FormFields';
import { adminFilterService, type AdminFilterConfiguration } from '../services/filterService';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';
import toast from 'react-hot-toast';

export default function FilterFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminFilterConfiguration> & { category?: string }>({
    name: '',
    key: '',
    type: 'Checkbox',
    displayOrder: 1,
    enabled: true,
    visible: true,
    sortOrder: 'Count High -> Low',
    defaultExpanded: true,
    showProductCounts: true,
    featuredFilter: false,
    category: searchParams.get('category') && searchParams.get('category') !== 'all' ? searchParams.get('category')! : '',
  });

  useEffect(() => {
    adminCategoryService.getCategories().then(setCategories).catch(console.error);

    if (isEditing && id) {
      const fetchConfig = async () => {
        try {
          setLoading(true);
          const data = await adminFilterService.getFilterById(id);
          setFormData({
            ...data,
            category: typeof (data as any).category === 'object' && (data as any).category ? (data as any).category._id : ((data as any).category || ''),
          });
        } catch (e) {
          toast.error('Failed to load filter configuration');
          navigate('/admin/filters');
        } finally {
          setLoading(false);
        }
      };
      fetchConfig();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    const name = target.name;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.key) {
      toast.error('Please enter both Display Name and Attribute Key');
      return;
    }

    try {
      setSaving(true);
      const payload: any = { 
        ...formData, 
        displayOrder: Number(formData.displayOrder) || 1,
        category: formData.category || null,
      };
      if (isEditing && id) {
        await adminFilterService.updateFilter(id, payload);
        toast.success('Filter configuration saved');
      } else {
        await adminFilterService.createFilter(payload);
        toast.success('New filter group created');
      }
      navigate('/admin/filters');
    } catch (err: any) {
      toast.error(err.message || 'Error saving filter');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading filter settings...</div>;

  return (
    <div className="pb-12 max-w-3xl mx-auto">
      <PageHeader title={isEditing ? `Configure "${formData.name}" Filter` : 'New Filter Group Configuration'} />

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Filter Group Properties</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput
              label="Display Label *"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="e.g. Color, Material, Availability"
            />

            <FormInput
              label="Attribute Parameter Key *"
              name="key"
              value={formData.key || ''}
              onChange={handleChange}
              disabled={isEditing}
              placeholder="e.g. color, material, availability, discount"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">UI Control Type *</label>
              <select
                name="type"
                value={formData.type || 'Checkbox'}
                onChange={handleChange}
                className="w-full h-10 border border-gray-300 rounded-md shadow-sm px-3 bg-white text-sm"
              >
                <option value="Checkbox">Checkbox List (Multi-select)</option>
                <option value="Radio">Radio List (Single-select)</option>
                <option value="Color Swatch">Color Swatch Circles</option>
                <option value="Price Range">Price Range Slider / Min-Max Inputs</option>
                <option value="Rating">Star Rating Thresholds</option>
                <option value="Availability">Stock Availability Checkboxes</option>
                <option value="Numeric Range">Generic Numeric Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option Sorting Order</label>
              <select
                name="sortOrder"
                value={formData.sortOrder || 'Count High -> Low'}
                onChange={handleChange}
                className="w-full h-10 border border-gray-300 rounded-md shadow-sm px-3 bg-white text-sm"
              >
                <option value="Count High -> Low">By Product Count (Highest First)</option>
                <option value="Alphabetical">Alphabetical (A → Z)</option>
                <option value="Manual">Manual Defined Sequence</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Scope (Where filter appears) *</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange as any}
                className="w-full h-10 border border-gray-300 rounded-md shadow-sm px-3 bg-white text-sm font-medium text-gray-800"
              >
                <option value="">🌐 Global (Apply across All Collections)</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    📁 {cat.name} Collection Only
                  </option>
                ))}
              </select>
            </div>

            <FormInput
              label="Display Order Sequence"
              name="displayOrder"
              type="number"
              value={String(formData.displayOrder || 1)}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Presentation & Ergonomics Toggles</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
              <input type="checkbox" name="enabled" checked={formData.enabled ?? true} onChange={handleChange} className="h-4 w-4 text-primary rounded" />
              <div className="text-sm font-medium text-gray-900">Enabled & Active</div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
              <input type="checkbox" name="visible" checked={formData.visible ?? true} onChange={handleChange} className="h-4 w-4 text-primary rounded" />
              <div className="text-sm font-medium text-gray-900">Visible on Storefront</div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
              <input type="checkbox" name="defaultExpanded" checked={formData.defaultExpanded ?? true} onChange={handleChange} className="h-4 w-4 text-primary rounded" />
              <div className="text-sm font-medium text-gray-900">Default Expanded in Sidebar</div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
              <input type="checkbox" name="showProductCounts" checked={formData.showProductCounts ?? true} onChange={handleChange} className="h-4 w-4 text-emerald-600 rounded" />
              <div>
                <div className="text-sm font-medium text-gray-900">Show Real-Time Product Counts</div>
                <div className="text-xs text-gray-500">e.g. "Beige (14)", "Cotton (28)"</div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/admin/filters')}
            className="px-6 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
