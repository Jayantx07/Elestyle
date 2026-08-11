// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { FormInput, FormSelect } from '../components/shared/FormFields';
import { adminCouponService, type AdminCoupon } from '../services/couponService';

export default function CouponFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [loading, setLoading] = useState(isEditing ? true : false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminCoupon>>({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscountAmount: 0,
    minPurchaseAmount: 0,
    maxUsageLimit: null,
    perCustomerUsageLimit: 1,
    startDate: new Date().toISOString().slice(0, 16),
    expiryDate: '',
    isActive: true,
    priority: 0,
    stackable: false,
    autoApply: false,
    allowGuest: true,
  });

  const fetchCoupon = async (cId: string) => {
    try {
      setLoading(true);
      const data = await adminCouponService.getCouponById(cId);
      
      let formattedStart = '';
      if (data.startDate) {
        formattedStart = new Date(data.startDate).toISOString().slice(0, 16);
      }
      let formattedExpiry = '';
      if (data.expiryDate) {
        formattedExpiry = new Date(data.expiryDate).toISOString().slice(0, 16);
      }

      setFormData({ 
        ...data, 
        startDate: formattedStart,
        expiryDate: formattedExpiry 
      });
    } catch (error) {
      console.error('Failed to fetch coupon', error);
      alert('Error loading coupon');
      navigate('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      fetchCoupon(id);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    
    if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      parsedValue = value === '' ? null : parseFloat(value);
    } else if (name === 'code') {
      parsedValue = value.toUpperCase().replace(/\s+/g, '');
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) return alert('Code is required');

    try {
      setSaving(true);
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate as string).toISOString() : undefined,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate as string).toISOString() : undefined,
      };

      if (isEditing) {
        await adminCouponService.updateCoupon(id, payload);
      } else {
        await adminCouponService.createCoupon(payload);
      }
      
      navigate('/admin/coupons');
    } catch (error) {
      console.error('Failed to save coupon', error);
      alert('Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading coupon...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader
        title={isEditing ? 'Edit Coupon' : 'Add New Coupon'}
        breadcrumbs={[
          { label: 'Coupons', path: '/admin/coupons' },
          { label: isEditing ? 'Edit' : 'New' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Coupon Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              helperText="e.g. SUMMER20 (No spaces)"
            />
            <FormSelect
              label="Status"
              name="isActive"
              value={formData.isActive ? 'true' : 'false'}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
              options={[
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' }
              ]}
              required
            />
            <FormInput
              label="Internal Title (Optional)"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
            />
            <FormInput
              label="Description (Optional)"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Discount Rules */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Discount Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormSelect
              label="Discount Type"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              options={[
                { label: 'Percentage (%)', value: 'percentage' },
                { label: 'Fixed Amount ($)', value: 'fixed' },
                { label: 'Free Shipping', value: 'free_shipping' }
              ]}
              required
            />
            <FormInput
              label={formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
              name="discountValue"
              type="number"
              min="0"
              step={formData.discountType === 'percentage' ? '1' : '0.01'}
              value={formData.discountValue}
              onChange={handleChange}
              required
              disabled={formData.discountType === 'free_shipping'}
            />
            <FormInput
              label="Max Discount Amount ($)"
              name="maxDiscountAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.maxDiscountAmount || ''}
              onChange={handleChange}
              helperText="0 for no limit"
              disabled={formData.discountType !== 'percentage'}
            />
            <FormInput
              label="Minimum Purchase ($)"
              name="minPurchaseAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.minPurchaseAmount || ''}
              onChange={handleChange}
              helperText="0 for no minimum"
            />
          </div>
        </div>

        {/* Limits & Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Limits & Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Global Usage Limit"
              name="maxUsageLimit"
              type="number"
              min="1"
              value={formData.maxUsageLimit === null ? '' : formData.maxUsageLimit}
              onChange={handleChange}
              helperText="Leave empty for unlimited"
            />
            <FormInput
              label="Per-Customer Limit"
              name="perCustomerUsageLimit"
              type="number"
              min="1"
              value={formData.perCustomerUsageLimit || ''}
              onChange={handleChange}
            />
            <FormInput
              label="Start Date & Time"
              name="startDate"
              type="datetime-local"
              value={formData.startDate || ''}
              onChange={handleChange}
            />
            <FormInput
              label="Expiry Date & Time"
              name="expiryDate"
              type="datetime-local"
              value={formData.expiryDate || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Behavior */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Behavior & Eligibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Priority (Higher applies first)"
              name="priority"
              type="number"
              value={formData.priority || 0}
              onChange={handleChange}
            />
            <div className="flex flex-col gap-3 mt-8">
              <FormCheckbox
                label="Allow Guest Checkout"
                name="allowGuest"
                checked={!!formData.allowGuest}
                onChange={handleChange}
              />
              <FormCheckbox
                label="Auto Apply at Checkout"
                name="autoApply"
                checked={!!formData.autoApply}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/coupons')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Coupon')}
          </button>
        </div>
      </form>
    </div>
  );
}
