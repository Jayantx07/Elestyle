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
    discountType: 'percentage',
    discountValue: 0,
    minPurchaseAmount: 0,
    expiryDate: '',
    status: 'Active',
  });

  const fetchCoupon = async (cId: string) => {
    try {
      setLoading(true);
      const data = await adminCouponService.getCouponById(cId);
      // Format date for datetime-local input if present
      let formattedDate = '';
      if (data.expiryDate) {
        const d = new Date(data.expiryDate);
        formattedDate = d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
      }
      setFormData({ ...data, expiryDate: formattedDate });
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
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (name === 'code') {
      parsedValue = value.toUpperCase().replace(/\s+/g, '');
    }
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.expiryDate) return alert('Code and Expiry Date are required');

    try {
      setSaving(true);
      const payload = {
        ...formData,
        // Convert local datetime to ISO string for backend
        expiryDate: new Date(formData.expiryDate as string).toISOString()
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
    <div className="max-w-2xl mx-auto pb-12">
      <PageHeader
        title={isEditing ? 'Edit Coupon' : 'Add New Coupon'}
        breadcrumbs={[
          { label: 'Coupons', path: '/admin/coupons' },
          { label: isEditing ? 'Edit' : 'New' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Expired', value: 'Expired' }
              ]}
              required
            />
            <FormSelect
              label="Discount Type"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              options={[
                { label: 'Percentage (%)', value: 'percentage' },
                { label: 'Fixed Amount ($)', value: 'fixed' }
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
            />
            <FormInput
              label="Minimum Purchase Amount ($)"
              name="minPurchaseAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.minPurchaseAmount}
              onChange={handleChange}
              required
              helperText="Set to 0 for no minimum"
            />
            <FormInput
              label="Expiry Date & Time"
              name="expiryDate"
              type="datetime-local"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
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
