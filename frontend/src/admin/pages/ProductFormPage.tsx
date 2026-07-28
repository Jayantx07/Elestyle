import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { FormInput, FormSelect, FormTextarea } from '../components/shared/FormFields';
import { ImageUpload, type ImageMetadata } from '../components/shared/ImageUpload';
import { adminProductService, type AdminProduct } from '../services/productService';
import { adminCategoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [loading, setLoading] = useState(isEditing ? true : false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    slug: '',
    category: '',
    description: '',
    price: 0,
    discount: 0,
    stock: 0,
    status: 'active',
    featured: false,
    tags: [],
  });

  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoriesList, setCategoriesList] = useState<import('../services/categoryService').AdminCategory[]>([]);

  const fetchCategories = async () => {
    try {
      const data = await adminCategoryService.getCategories();
      setCategoriesList(data);
    } catch(error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchProduct = async (pId: string) => {
    try {
      setLoading(true);
      const data = await adminProductService.getProductById(pId);
      // If the product comes with a populated category object, extract its _id
      const categoryId = typeof data.category === 'object' && data.category !== null ? (data.category as any)._id : data.category;
      setFormData({ ...data, category: categoryId });
      if (data.images) setImages(data.images);
    } catch (error) {
      console.error('Failed to fetch product', error);
      alert('Error loading product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEditing && id) {
      fetchProduct(id);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue,
      // Auto-generate slug if name changes and we aren't editing an existing fixed slug
      ...(name === 'name' && !isEditing ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
    }));
  };

  const handleTagAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) || [] }));
  };

  const uploadNewImages = async (category: string, slug: string): Promise<ImageMetadata[]> => {
    const newFiles = images.filter(img => img.file);
    if (newFiles.length === 0) return images;

    const data = new FormData();
    data.append('category', category);
    data.append('productSlug', slug);
    newFiles.forEach(img => {
      if (img.file) data.append('images', img.file);
    });

    const res = await fetch('/api/v1/upload', {
      method: 'POST',
      body: data
    });

    if (!res.ok) throw new Error('Failed to upload images');
    
    const result = await res.json();
    const uploadedMeta: any[] = result.data;

    // Reconstruct the images array replacing files with uploaded metadata
    let uploadIndex = 0;
    return images.map(img => {
      if (img.file) {
        const meta = uploadedMeta[uploadIndex++];
        return {
          ...img,
          file: undefined,
          public_id: meta.public_id,
          secure_url: meta.secure_url,
          previewUrl: meta.secure_url
        };
      }
      return img;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return alert('Please select a category');
    if (!formData.slug) return alert('Slug is required');

    try {
      setSaving(true);
      
      const categoryId = formData.category as string;
      const categoryObj = categoriesList.find(c => c._id === categoryId);
      const categoryName = categoryObj ? categoryObj.name : 'unnamed-category';
      
      const finalImages = await uploadNewImages(categoryName, formData.slug as string);
      
      const payload = { ...formData, images: finalImages };

      // 2. Save product
      if (isEditing) {
        await adminProductService.updateProduct(id, payload);
        toast.success('Product updated successfully!');
      } else {
        await adminProductService.createProduct(payload);
        toast.success('Product created successfully!');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product', error);
      toast.error('Failed to save product. Check console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader
        title={isEditing ? 'Edit Product' : 'Add New Product'}
        breadcrumbs={[
          { label: 'Products', path: '/admin/products' },
          { label: isEditing ? 'Edit' : 'New' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              helperText="URL friendly identifier"
            />
            <FormSelect
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoriesList.map(c => ({ label: c.name, value: c._id }))}
              required
            />
            {(() => {
              const selectedCategory = categoriesList.find(c => c._id === formData.category);
              if (selectedCategory && selectedCategory.subCategories && selectedCategory.subCategories.length > 0) {
                return (
                  <FormSelect
                    label="Sub-Category"
                    name="subCategory"
                    value={formData.subCategory || ''}
                    onChange={handleChange}
                    options={[
                      { label: 'None', value: '' },
                      ...selectedCategory.subCategories.map(sub => ({ label: sub, value: sub }))
                    ]}
                  />
                );
              }
              return null;
            })()}
            <FormSelect
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive / Draft', value: 'inactive' }
              ]}
              required
            />
          </div>
          <div className="mt-6">
            <FormTextarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        {/* Media */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Media</h2>
            <p className="text-sm text-gray-500">Upload images for the product. The first image will be used as the thumbnail.</p>
          </div>
          <ImageUpload 
            images={images} 
            onChange={setImages} 
            category={formData.category}
            productSlug={formData.slug}
          />
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Price ($)"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Discount ($)"
              name="discount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discount}
              onChange={handleChange}
            />
            <FormInput
              label="Stock Quantity"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Organization */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
          
          <div className="mb-4">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>Mark as Featured Product (Shows on homepage)</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              placeholder="Press Enter to add tags"
              className="block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm px-3 py-2 focus:border-primary focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {saving && <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
