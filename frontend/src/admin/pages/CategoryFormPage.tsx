import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { FormInput, FormTextarea } from '../components/shared/FormFields';
import { ImageUpload, type ImageMetadata } from '../components/shared/ImageUpload';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';

export default function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [loading, setLoading] = useState(isEditing ? true : false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminCategory>>({
    name: '',
    slug: '',
    description: '',
  });

  const [images, setImages] = useState<ImageMetadata[]>([]);

  const fetchCategory = async (catId: string) => {
    try {
      setLoading(true);
      const data = await adminCategoryService.getCategoryById(catId);
      setFormData(data);
      if (data.image) setImages([data.image]);
    } catch (error) {
      console.error('Failed to fetch category', error);
      alert('Error loading category');
      navigate('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      fetchCategory(id);
    }
  }, [id]); // fetchCategory is not a dependency we need to track here as it doesn't use outer scope variables that change

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug if name changes and we aren't editing an existing fixed slug
      ...(name === 'name' && !isEditing ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
    }));
  };

  const uploadNewImage = async (slug: string): Promise<ImageMetadata | undefined> => {
    const newFiles = images.filter(img => img.file);
    if (newFiles.length === 0) return images[0];

    const data = new FormData();
    data.append('category', 'Categories'); // We store category images in ElleStyle/Products/Categories/
    data.append('productSlug', slug);
    data.append('images', newFiles[0].file!);

    const res = await fetch('/api/v1/upload', {
      method: 'POST',
      body: data
    });

    if (!res.ok) throw new Error('Failed to upload image');
    
    const result = await res.json();
    const meta = result.data[0];

    return {
      public_id: meta.public_id,
      secure_url: meta.secure_url,
      previewUrl: meta.secure_url,
      isFeatured: false
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug) return alert('Slug is required');

    try {
      setSaving(true);
      
      const uploadedImage = await uploadNewImage(formData.slug as string);
      const payload = { ...formData, image: uploadedImage };

      if (isEditing) {
        await adminCategoryService.updateCategory(id, payload);
      } else {
        await adminCategoryService.createCategory(payload);
      }
      
      navigate('/admin/categories');
    } catch (error) {
      console.error('Failed to save category', error);
      alert('Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading category...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <PageHeader
        title={isEditing ? 'Edit Category' : 'Add New Category'}
        breadcrumbs={[
          { label: 'Categories', path: '/admin/categories' },
          { label: isEditing ? 'Edit' : 'New' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-6">
            <FormInput
              label="Category Name"
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
            <FormTextarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Image</h2>
          <ImageUpload 
            images={images} 
            onChange={setImages} 
            maxImages={1}
            category="Categories"
            productSlug={formData.slug}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  );
}
