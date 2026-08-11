// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { FormInput, FormTextarea } from '../components/shared/FormFields';
import { ImageUpload, type ImageMetadata } from '../components/shared/ImageUpload';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';
import { adminSubCategoryService, type AdminSubCategory } from '../services/subCategoryService';
import { Plus, Layers, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryKeys, subCategoryKeys } from '@/lib/queryKeys';
import { apiClient } from '@/lib/apiClient';

export default function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id && id !== 'new';

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

  const [subCategoriesInput, setSubCategoriesInput] = useState('');

  const { data: fetchedCategory, isLoading: isLoadingCategory } = useQuery({
    queryKey: categoryKeys.detail(id as string),
    queryFn: () => adminCategoryService.getCategoryById(id as string),
    enabled: isEditing,
  });

  const { data: relationalSubs = [] } = useQuery({
    queryKey: [...subCategoryKeys.lists(), { category: id }],
    queryFn: () => adminSubCategoryService.getSubCategories({ category: id }),
    enabled: isEditing,
  });

  useEffect(() => {
    if (fetchedCategory) {
      setFormData(fetchedCategory);
      if (fetchedCategory.subCategories) setSubCategoriesInput(fetchedCategory.subCategories.join(', '));
      if (fetchedCategory.image) setImages([{ secure_url: fetchedCategory.image, public_id: '', previewUrl: fetchedCategory.image, isFeatured: false }]);
      if (fetchedCategory.bannerImage) setBannerImages([{ secure_url: fetchedCategory.bannerImage, public_id: '', previewUrl: fetchedCategory.bannerImage, isFeatured: false }]);
      if (fetchedCategory.icon) setIcons([{ secure_url: fetchedCategory.icon, public_id: '', previewUrl: fetchedCategory.icon, isFeatured: false }]);
    }
  }, [fetchedCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
      ...(name === 'name' && !isEditing ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {})
    }));
  };

  const uploadNewImage = async (slug: string, imageState: ImageMetadata[], suffix: string): Promise<string> => {
    const newFiles = imageState.filter((img) => img.file);
    if (newFiles.length === 0) return imageState[0]?.secure_url || '';

    const data = new FormData();
    data.append('category', 'Categories'); 
    data.append('productSlug', slug + suffix);
    data.append('images', newFiles[0].file!);

    const result = await apiClient('/api/v1/upload', {
      method: 'POST',
      body: data
    });

    return result.data[0].secure_url;
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing) {
        return adminCategoryService.updateCategory(id as string, payload);
      } else {
        return adminCategoryService.createCategory(payload);
      }
    },
    onSuccess: () => {
      toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      navigate('/admin/categories');
    },
    onError: (error) => {
      console.error('Failed to save category', error);
      toast.error('Failed to save category.');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug) return toast.error('Slug is required');

    try {
      const uploadedImage = await uploadNewImage(formData.slug as string, images, '');
      const uploadedBanner = await uploadNewImage(formData.slug as string, bannerImages, '-banner');
      const uploadedIcon = await uploadNewImage(formData.slug as string, icons, '-icon');

      const payload = { 
        ...formData, 
        subCategories: subCategoriesInput.split(',').map((s) => s.trim()).filter((s) => s !== ''),
        image: uploadedImage,
        bannerImage: uploadedBanner,
        icon: uploadedIcon,
        schemaVersion: 2,
      };

      saveMutation.mutate(payload);
    } catch (error) {
      console.error('Failed to upload images', error);
      toast.error('Failed to upload images.');
    }
  };

  if (isEditing && isLoadingCategory) return <div className="p-8 text-center text-gray-500">Loading category...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <PageHeader
        title={isEditing ? 'Edit Category Architecture' : 'Add New Category'}
        breadcrumbs={[
          { label: 'Categories', path: '/admin/categories' },
          { label: isEditing ? 'Edit' : 'New' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2">Basic Category Metadata</h2>
          <FormInput
            label="Category Name *"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Slug (URL) *"
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

        {/* Relational SubCategory Module (WF-05 Enterprise Architecture) */}
        {isEditing && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-200 bg-amber-50/20 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-700" />
                <h2 className="text-base font-bold text-gray-900">Relational SubCategories (WF-05)</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/admin/subcategories/new?category=${id}`)}
                className="inline-flex items-center gap-1 bg-amber-700 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-amber-800 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add SubCategory
              </button>
            </div>

            {relationalSubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relationalSubs.map((sub) => (
                  <div key={sub._id} onClick={() => navigate(`/admin/subcategories/${sub._id}`)} className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200 hover:border-primary shadow-sm cursor-pointer group">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{sub.name}</div>
                      <div className="text-xs text-gray-400 font-mono">/{sub.slug}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">{sub.productCount !== undefined ? `${sub.productCount} products` : 'View'}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No relational subcategories created under this category yet.</p>
            )}

            <div className="pt-2">
              <FormInput
                label="Legacy Sub-Categories fallback string (Expand/Migrate compatibility)"
                name="subCategories"
                value={subCategoriesInput}
                onChange={(e) => setSubCategoriesInput(e.target.value)}
                helperText="Retained during WF-05 transition for backward compatibility."
              />
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2">Visibility & Placement Toggles</h2>
          
          <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
            <input type="checkbox" name="showInNavbar" checked={formData.showInNavbar} onChange={handleChange} className="rounded border-gray-300 text-primary h-4 w-4" />
            <span className="text-sm font-medium text-gray-800">Show in Navbar Dropdown</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
            <input type="checkbox" name="showInHomepage" checked={formData.showInHomepage} onChange={handleChange} className="rounded border-gray-300 text-primary h-4 w-4" />
            <span className="text-sm font-medium text-gray-800">Show in Homepage Featured Category Grid</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
            <input type="checkbox" name="showInCircularCarousel" checked={formData.showInCircularCarousel} onChange={handleChange} className="rounded border-gray-300 text-primary h-4 w-4" />
            <span className="text-sm font-medium text-gray-800">Show in Category Top Circular Carousel</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
            <input type="checkbox" name="showInSearch" checked={formData.showInSearch} onChange={handleChange} className="rounded border-gray-300 text-primary h-4 w-4" />
            <span className="text-sm font-medium text-gray-800">Show in Search Engine Suggestions</span>
          </label>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2">Category Media Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Main Thumbnail</h3>
              <ImageUpload images={images} onImagesChange={setImages} maxImages={1} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Collection Banner</h3>
              <ImageUpload images={bannerImages} onImagesChange={setBannerImages} maxImages={1} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Monochrome Icon</h3>
              <ImageUpload images={icons} onImagesChange={setIcons} maxImages={1} />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-xs text-gray-400 font-mono">Schema v2 (Idempotent Protected)</span>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-8 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : (isEditing ? 'Save Category Changes' : 'Create Category')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
