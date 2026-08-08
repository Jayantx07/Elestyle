import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, UploadCloud, ImagePlus } from 'lucide-react';
import { FormInput, FormSelect, FormTextarea } from '../shared/FormFields';
import { LandingBannerPreview } from './LandingBannerPreview';
import type { AdminLandingBanner, LandingBannerPayload } from '../../services/landingBannerService';
import type { AdminCategory } from '../../services/categoryService';

interface LandingBannerFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  categories: AdminCategory[];
  initialBanner?: AdminLandingBanner | null;
  isSaving?: boolean;
  error?: string | null;
  onSubmit: (payload: LandingBannerPayload) => void;
  onClose: () => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function LandingBannerFormModal({
  isOpen,
  mode,
  categories,
  initialBanner,
  isSaving = false,
  error = null,
  onSubmit,
  onClose,
}: LandingBannerFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setTitle(initialBanner?.title || '');
    setSubtitle(initialBanner?.subtitle || '');
    setCategoryId(typeof initialBanner?.category === 'object' ? initialBanner.category._id : '');
    setDisplayOrder(String(initialBanner?.displayOrder ?? 1));
    setIsActive(initialBanner?.isActive ?? true);
    setImageFile(null);
    setImagePreview(initialBanner?.imageUrl || '');
    setLocalError(null);
  }, [initialBanner, isOpen]);

  useEffect(() => {
    if (!imageFile) {
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const selectedCategoryName = useMemo(() => {
    const matchedCategory = categories.find((category) => category._id === categoryId);
    return matchedCategory?.name || '';
  }, [categories, categoryId]);

  const isDirty = useMemo(() => {
    const initialCategoryId = typeof initialBanner?.category === 'object' ? initialBanner.category._id : '';
    return (
      title !== (initialBanner?.title || '') ||
      subtitle !== (initialBanner?.subtitle || '') ||
      categoryId !== initialCategoryId ||
      displayOrder !== String(initialBanner?.displayOrder ?? 1) ||
      isActive !== (initialBanner?.isActive ?? true) ||
      !!imageFile
    );
  }, [categoryId, displayOrder, imageFile, initialBanner?.displayOrder, initialBanner?.isActive, initialBanner?.subtitle, initialBanner?.title, isActive, subtitle, title]);

  useEffect(() => {
    if (!isOpen || !isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isOpen]);

  if (!isOpen) return null;

  const closeSafely = () => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) {
      return;
    }
    onClose();
  };

  const validateAndSetImage = (file?: File | null) => {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setLocalError('Invalid image type. Use JPG, JPEG, PNG, or WebP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setLocalError('Image must be 5 MB or smaller.');
      return;
    }

    setLocalError(null);
    setImageFile(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetImage(event.target.files?.[0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetImage(event.dataTransfer.files?.[0]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextTitle = title.trim();
    if (!nextTitle) {
      setLocalError('Banner title is required.');
      return;
    }

    if (!categoryId) {
      setLocalError('Please select a category.');
      return;
    }

    const parsedOrder = Number.parseInt(displayOrder, 10);
    if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
      setLocalError('Display order must be a valid non-negative number.');
      return;
    }

    if (mode === 'create' && !imageFile) {
      setLocalError('Banner image is required.');
      return;
    }

    setLocalError(null);

    onSubmit({
      title: nextTitle,
      subtitle: subtitle.trim(),
      category: categoryId,
      displayOrder: parsedOrder,
      isActive,
      imageFile: imageFile || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Add Banner' : 'Edit Banner'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage the storefront banner content displayed on the landing page.
            </p>
          </div>

          <button
            type="button"
            onClick={closeSafely}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImagePlus className="h-4 w-4" />
                Banner Image
              </div>

              <div
                className={`relative flex min-h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-white hover:border-primary/70'
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Banner preview" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <UploadCloud className="h-10 w-10 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                      <p className="mt-1 text-xs text-gray-500">JPG, JPEG, PNG or WebP, up to 5 MB</p>
                    </div>
                  </div>
                )}

                {imagePreview && (
                  <div className="absolute inset-0 bg-black/20" />
                )}

                <div className="absolute bottom-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-900 shadow-sm transition-colors hover:bg-gray-100"
                  >
                    {imagePreview ? 'Replace Image' : 'Choose File'}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <FormInput
                label="Heading"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                placeholder="Royal Rajasthani Living"
              />

              <FormTextarea
                label="Subtitle"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="Bring handcrafted Rajasthan into your home."
              />

              <FormSelect
                label="Category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                options={categories.map((category) => ({ value: category._id, label: category.name }))}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput
                  label="Display Order"
                  type="number"
                  min="0"
                  step="1"
                  value={displayOrder}
                  onChange={(event) => setDisplayOrder(event.target.value)}
                  required
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setIsActive(true)}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsActive(false)}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${!isActive ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              {(localError || error) && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {localError || error}
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeSafely}
                  className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-gray-500">Preview</h3>
              <p className="mt-1 text-sm text-gray-500">This mirrors the storefront banner presentation.</p>
            </div>

            <LandingBannerPreview
              title={title || 'Banner title'}
              subtitle={subtitle}
              imageUrl={imagePreview}
              categoryName={selectedCategoryName}
            />

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-800">Tips</p>
              <ul className="mt-2 space-y-2">
                <li>Use a wide, high-resolution image for the best storefront result.</li>
                <li>Keep the heading short so it stays readable on mobile.</li>
                <li>Only active banners are shown on the public landing page.</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}