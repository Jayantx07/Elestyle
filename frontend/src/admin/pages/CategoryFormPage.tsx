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
    displayOrder: 0,
    showInNavbar: false,
    showInHomepage: false,
    showInCircularCarousel: false,
    showInSearch: true,
    seoTitle: '',
    seoDescription: '',
  });

  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [bannerImages, setBannerImages] = useState<ImageMetadata[]>([]);
  const [icons, setIcons] = useState<ImageMetadata[]>([]);

  const fetchCategory = async (catId: string) => {
    try {
      setLoading(true);
      const data = await adminCategoryService.getCategoryById(catId);
      setFormData(data);
      if (data.image) setImages([{ secure_url: data.image, public_id: '', previewUrl: data.image, isFeatured: false }]);
      if (data.bannerImage) setBannerImages([{ secure_url: data.bannerImage, public_id: '', previewUrl: data.bannerImage, isFeatured: false }]);
      if (data.icon) setIcons([{ secure_url: data.icon, public_id: '', previewUrl: data.icon, isFeatured: false }]);
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
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
      // Auto-generate slug if name changes and we aren't editing an existing fixed slug
      ...(name === 'name' && !isEditing ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
    }));
  };

  const uploadNewImage = async (slug: string, imageState: ImageMetadata[], suffix: string): Promise<string> => {
    const newFiles = imageState.filter(img => img.file);
    if (newFiles.length === 0) return imageState[0]?.secure_url || '';

    const data = new FormData();
    data.append('category', 'Categories'); 
    data.append('productSlug', slug + suffix);
    data.append('images', newFiles[0].file!);

    const res = await fetch('/api/v1/upload', {
      method: 'POST',
      body: data
    });

    if (!res.ok) throw new Error('Failed to upload image');
    
    const result = await res.json();
    return result.data[0].secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug) return alert('Slug is required');

    try {
      setSaving(true);
      
      const uploadedImage = await uploadNewImage(formData.slug as string, images, '');
      const uploadedBanner = await uploadNewImage(formData.slug as string, bannerImages, '-banner');
      const uploadedIcon = await uploadNewImage(formData.slug as string, icons, '-icon');

      const payload = { 
        ...formData, 
        image: uploadedImage,
        bannerImage: uploadedBanner,
        icon: uploadedIcon 
      };

      if (isEditing) {
        await adminCategoryService.updateCategory(id as string, payload);
      } else {
        await adminCategoryService.createCategory(payload);
      }
      
      const channel = new BroadcastChannel('category_updates');
      channel.postMessage('updated');
      channel.close();

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
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Slug (URL)"
              name="slug"
              value={formData.slug || ''}
              onChange={handleChange}
              required
              helperText="Changing slug affects SEO and existing links. Confirm before modifying."
            />
            <FormTextarea
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
            />
            <FormInput
              label="Display Order"
              name="displayOrder"
              type="number"
              value={formData.displayOrder?.toString() || '0'}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Visibility settings</h2>
          
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="showInNavbar" checked={formData.showInNavbar} onChange={handleChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
            <span>Show in Navbar</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="showInHomepage" checked={formData.showInHomepage} onChange={handleChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
            <span>Show in Homepage Grid</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="showInCircularCarousel" checked={formData.showInCircularCarousel} onChange={handleChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
            <span>Show in Circular Carousel</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="showInSearch" checked={formData.showInSearch} onChange={handleChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
            <span>Show in Search Engine</span>
          </label>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-8">
          <h2 className="text-lg font-semibold text-gray-900">Images</h2>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Main Image (Thumbnail)</h3>
            <ImageUpload images={images} onChange={setImages} maxImages={1} category="Categories" productSlug={formData.slug} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Banner Image</h3>
            <ImageUpload images={bannerImages} onChange={setBannerImages} maxImages={1} category="Categories" productSlug={formData.slug + '-banner'} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Icon</h3>
            <ImageUpload images={icons} onChange={setIcons} maxImages={1} category="Categories" productSlug={formData.slug + '-icon'} />
          </div>
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
