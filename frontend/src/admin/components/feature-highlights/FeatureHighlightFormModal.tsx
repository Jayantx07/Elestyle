import React, { useState, useEffect } from 'react';
import { X, Loader2, ImageIcon } from 'lucide-react';
import type { AdminFeatureHighlight, FeatureHighlightFormData } from '../../services/featureHighlightService';
import type { AdminCategory } from '../../services/categoryService';

interface FeatureHighlightFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData: AdminFeatureHighlight | null;
  categories: AdminCategory[];
  isSaving: boolean;
  uploadProgress: number;
  error: string | null;
  onSubmit: (data: FeatureHighlightFormData) => void;
  onClose: () => void;
}

export const FeatureHighlightFormModal: React.FC<FeatureHighlightFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  categories,
  isSaving,
  uploadProgress,
  error,
  onSubmit,
  onClose,
}) => {
  const [altText, setAltText] = useState('');
  const [category, setCategory] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setAltText(initialData.altText || '');
        const cat = initialData.category;
        setCategory(cat ? (typeof cat === 'object' ? (cat as AdminCategory)._id : cat as string) : '');
        setDisplayOrder(initialData.displayOrder);
        setIsActive(initialData.isActive);
        setImageFile(null);
        setPreviewUrl(initialData.imageSrc || null);
      } else {
        setAltText('');
        setCategory('');
        setDisplayOrder(1);
        setIsActive(true);
        setImageFile(null);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, mode, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size exceeds the 5MB limit.');
      e.target.value = '';
      return;
    }
    
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create' && !imageFile) {
      alert('Please select an image file to upload.');
      return;
    }
    onSubmit({
      altText,
      category,
      displayOrder,
      isActive,
      imageFile: imageFile || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Add Feature Highlight' : 'Edit Feature Highlight'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form id="feature-highlight-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category (Used for Badge)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isSaving}
                >
                  <option value="">None (No badge)</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Display Order</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Alt Text (Accessibility)</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                maxLength={120}
                placeholder="e.g. Handmade Earring with green stones"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isSaving}
              />
              <p className="mt-1 text-xs text-gray-500">Important for SEO and screen readers.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image File {mode === 'create' && <span className="text-red-500">*</span>}
              </label>
              
              <div className="mt-2 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 relative overflow-hidden group hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  {previewUrl ? (
                    <div className="relative mx-auto h-48 w-36 overflow-hidden rounded-lg shadow-md bg-gray-100">
                      <img src={previewUrl} className="h-full w-full object-cover" alt="Preview" />
                    </div>
                  ) : (
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  
                  <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                    >
                      <span>{previewUrl ? 'Change image' : 'Upload an image'}</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={handleImageChange}
                        disabled={isSaving}
                      />
                    </label>
                  </div>
                  <p className="text-xs leading-5 text-gray-500 mt-1">JPEG, PNG, WebP up to 5MB (Portrait 3:4 aspect ratio recommended)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isSaving}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex flex-col">
                <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Active (Visible on Storefront)
                </label>
                <span className="text-xs text-gray-500">Inactive highlights are hidden from the carousel.</span>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="w-1/2">
            {isSaving && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs text-gray-600 font-medium">{uploadProgress}%</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="feature-highlight-form"
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create Highlight' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
