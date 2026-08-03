import React, { useState, useRef } from 'react';
import { UploadCloud, X, Star, MoveLeft, MoveRight } from 'lucide-react';

export interface ImageMetadata {
  public_id?: string;
  secure_url?: string;
  file?: File;
  previewUrl: string;
  isFeatured: boolean;
  isUploading?: boolean;
}

interface ImageUploadProps {
  images: ImageMetadata[];
  onChange: (images: ImageMetadata[]) => void;
  maxImages?: number;
  category?: string;
  productSlug?: string;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function OverlayButton({
  title,
  onClick,
  className,
  children,
  disabled = false,
}: {
  title: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className} title={title}>
      {children}
    </button>
  );
}

function StatusBadge({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={className}>{children}</div>;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  category: _category,
  productSlug: _productSlug,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: FileList | File[]) => {
    const newFiles = Array.from(files).filter((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));

    if (newFiles.length === 0) return;

    if (images.length + newFiles.length > maxImages) {
      alert(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    const newImageMetas: ImageMetadata[] = newFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isFeatured: false,
    }));

    // If this is the first image, make it featured
    if (images.length === 0 && newImageMetas.length > 0) {
      newImageMetas[0].isFeatured = true;
    }

    onChange([...images, ...newImageMetas]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = [...images];
    const removed = newImages.splice(indexToRemove, 1)[0];
    
    // Revoke object URL to prevent memory leaks
    if (removed.file && removed.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }

    if (removed.isFeatured && newImages.length > 0) {
      newImages[0].isFeatured = true;
    }

    onChange(newImages);
  };

  const setFeatured = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isFeatured: i === index,
    }));
    onChange(newImages);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const swapIndex = direction === 'left' ? index - 1 : index + 1;
    
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    
    onChange(newImages);
  };

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG or WebP (MAX. 5MB)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileInput}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
          {images.map((img, index) => (
            <div
              key={img.public_id || img.previewUrl}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                img.isFeatured ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-gray-200'
              }`}
            >
              <img
                src={img.secure_url || img.previewUrl}
                alt={`Upload preview ${index}`}
                className="w-full h-32 object-cover"
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <OverlayButton
                    title="Set as Featured Image"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFeatured(index);
                    }}
                    className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
                      img.isFeatured ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/40'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={img.isFeatured ? 'currentColor' : 'none'} />
                  </OverlayButton>

                  <OverlayButton
                    title="Remove Image"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </OverlayButton>
                </div>

                <div className="flex justify-center gap-2">
                  <OverlayButton
                    title="Move Left"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, 'left');
                    }}
                    disabled={index === 0}
                    className="p-1 rounded bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 transition-colors"
                  >
                    <MoveLeft className="w-4 h-4" />
                  </OverlayButton>
                  <OverlayButton
                    title="Move Right"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, 'right');
                    }}
                    disabled={index === images.length - 1}
                    className="p-1 rounded bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 transition-colors"
                  >
                    <MoveRight className="w-4 h-4" />
                  </OverlayButton>
                </div>
              </div>

              <div className="absolute bottom-0 inset-x-0 flex flex-col pointer-events-none">
                {img.isFeatured && (
                  <StatusBadge className="bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase text-center w-full">
                    Featured
                  </StatusBadge>
                )}
                {img.isUploading && (
                  <StatusBadge className="bg-blue-500/80 text-white text-[10px] font-bold px-2 py-1 text-center w-full">
                    Uploading...
                  </StatusBadge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
