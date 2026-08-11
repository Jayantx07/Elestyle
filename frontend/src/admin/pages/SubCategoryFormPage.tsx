// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { FormInput, FormTextarea } from '../components/shared/FormFields';
import { ImageUpload, type ImageMetadata } from '../components/shared/ImageUpload';
import { adminSubCategoryService, type AdminSubCategory } from '../services/subCategoryService';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryKeys, subCategoryKeys } from '@/lib/queryKeys';
import { apiClient } from '@/lib/apiClient';

export default function SubCategoryFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id && id !== 'new';

  const [formData, setFormData] = useState<Partial<AdminSubCategory>>({
    name: '',
    slug: '',
    description: '',
    category: searchParams.get('category') || '',
    displayOrder: 0,
    isActive: true,
    featured: false,
    showInNavbar: false,
    showInHomepage: false,
    showInCircularCarousel: true,
    showInSearch: true,
    seoTitle: '',
    seoDescription: '',
  });

  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [bannerImages, setBannerImages] = useState<ImageMetadata[]>([]);
  const [icons, setIcons] = useState<ImageMetadata[]>([]);

  const { data: categories = [] } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => adminCategoryService.getCategories(),
  });

  const { data: fetchedSubCategory, isLoading: isLoadingSubCategory } = useQuery({
    queryKey: subCategoryKeys.detail(id as string),
    queryFn: () => adminSubCategoryService.getSubCategoryById(id as string),
    enabled: isEditing,
  });

  useEffect(() => {
    if (!formData.category && categories.length > 0 && !isEditing) {
      setFormData((prev) => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories, isEditing, formData.category]);

  useEffect(() => {
    if (fetchedSubCategory) {
      setFormData({
        ...fetchedSubCategory,
        category: typeof fetchedSubCategory.category === 'object' ? fetchedSubCategory.category._id : fetchedSubCategory.category,
      });
      if (fetchedSubCategory.image) setImages([{ secure_url: fetchedSubCategory.image, public_id: '', previewUrl: fetchedSubCategory.image, isFeatured: false }]);
      if (fetchedSubCategory.bannerImage) setBannerImages([{ secure_url: fetchedSubCategory.bannerImage, public_id: '', previewUrl: fetchedSubCategory.bannerImage, isFeatured: false }]);
      if (fetchedSubCategory.icon) setIcons([{ secure_url: fetchedSubCategory.icon, public_id: '', previewUrl: fetchedSubCategory.icon, isFeatured: false }]);
    }
  }, [fetchedSubCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadNewImage = async (slug: string, imageState: ImageMetadata[], suffix: string): Promise<string> => {
    const newFiles = imageState.filter((img) => img.file);
    if (newFiles.length === 0) return imageState[0]?.secure_url || imageState[0]?.previewUrl || '';

    const data = new FormData();
    data.append('category', 'SubCategories');
    data.append('productSlug', (slug || 'subcat') + suffix);
    data.append('images', newFiles[0].file!);

    const result = await apiClient('/api/v1/upload', {
      method: 'POST',
      body: data,
    });

    return result.data[0].secure_url;
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: Partial<AdminSubCategory>) => {
      if (isEditing && id) {
        return adminSubCategoryService.updateSubCategory(id, payload);
      } else {
        return adminSubCategoryService.createSubCategory(payload);
      }
    },
    onSuccess: () => {
      toast.success(`SubCategory ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: subCategoryKeys.all });
      navigate('/admin/subcategories');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error saving subcategory');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      toast.error('Please fill in required fields: Name and Parent Category');
      return;
    }

    try {
      const slugValue = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const uploadedImage = await uploadNewImage(slugValue, images, '');
      const uploadedBanner = await uploadNewImage(slugValue, bannerImages, '-banner');
      const uploadedIcon = await uploadNewImage(slugValue, icons, '-icon');

      const payload: Partial<AdminSubCategory> = {
        ...formData,
        image: uploadedImage,
        bannerImage: uploadedBanner,
        icon: uploadedIcon,
        displayOrder: Number(formData.displayOrder) || 0,
      };

      saveMutation.mutate(payload);
    } catch (error: any) {
      toast.error(error.message || 'Error saving subcategory images');
    }
  };

  if (isEditing && isLoadingSubCategory) {
    return <div className="p-8 text-center text-gray-500">Loading subcategory details...</div>;
  }

  return (
    <div className="pb-12 max-w-4xl mx-auto">
      <PageHeader title={isEditing ? 'Edit SubCategory' : 'New SubCategory'} />

      <form onSubmit={handleSubmit} className="space-y-8 mt-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              label="SubCategory Name *"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="e.g. Plant Hangers, Tote Bags"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
              <select
                name="category"
                value={typeof formData.category === 'object' ? formData.category._id : formData.category || ''}
                onChange={handleChange}
                className="w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm border px-3 bg-white"
                required
              >
                <option value="">Select a Parent Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <FormInput
              label="URL Slug (Optional, auto-generated)"
              name="slug"
              value={formData.slug || ''}
              onChange={handleChange}
              placeholder="plant-hangers"
            />

            <FormInput
              label="Display Order"
              name="displayOrder"
              type="number"
              value={String(formData.displayOrder || 0)}
              onChange={handleChange}
            />
          </div>

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Brief description of this collection for storefront banner..."
          />
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Media Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail / Card Image</label>
              <ImageUpload images={images} onImagesChange={setImages} maxImages={1} />
              <p className="text-xs text-gray-500 mt-1">Used on collection circle cards and sidebar filters.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Collection Banner Image</label>
              <ImageUpload images={bannerImages} onImagesChange={setBannerImages} maxImages={1} />
              <p className="text-xs text-gray-500 mt-1">Hero background when user selects this filter.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon Asset</label>
              <ImageUpload images={icons} onImagesChange={setIcons} maxImages={1} />
              <p className="text-xs text-gray-500 mt-1">Minimal vector or monochrome icon for navigation.</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Visibility & Placement Toggles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
              <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleChange} className="h-4 w-4 text-primary rounded border-gray-300" />
              <div>
                <div className="text-sm font-medium text-gray-900">Active Status</div>
                <div className="text-xs text-gray-500">Enable or disable viewing this subcategory publicly.</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
              <input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleChange} className="h-4 w-4 text-purple-600 rounded border-gray-300" />
              <div>
                <div className="text-sm font-medium text-gray-900">Featured SubCategory ⭐</div>
                <div className="text-xs text-gray-500">Highlights item on Popular Collections widgets.</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
              <input type="checkbox" name="showInCircularCarousel" checked={formData.showInCircularCarousel || false} onChange={handleChange} className="h-4 w-4 text-primary rounded border-gray-300" />
              <div>
                <div className="text-sm font-medium text-gray-900">Top Circular Carousel</div>
                <div className="text-xs text-gray-500">Show in category page top circle carousel.</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-md hover:bg-gray-50">
              <input type="checkbox" name="showInNavbar" checked={formData.showInNavbar || false} onChange={handleChange} className="h-4 w-4 text-primary rounded border-gray-300" />
              <div>
                <div className="text-sm font-medium text-gray-900">Navbar Menu</div>
                <div className="text-xs text-gray-500">Display under dropdown in primary site header.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-900 border-b pb-2">SEO Optimization (Protected by slugHistory)</h3>
          <div className="space-y-4">
            <FormInput
              label="SEO Meta Title"
              name="seoTitle"
              value={formData.seoTitle || ''}
              onChange={handleChange}
              placeholder="e.g. Handmade Macramé Plant Hangers Online | ElleStyle"
            />
            <FormTextarea
              label="SEO Meta Description"
              name="seoDescription"
              value={formData.seoDescription || ''}
              onChange={handleChange}
              rows={2}
              placeholder="Shop handmade boho chic macramé plant hangers and decor..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/admin/subcategories')}
            className="px-6 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-6 py-2 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create SubCategory'}
          </button>
        </div>
      </form>
    </div>
  );
}
