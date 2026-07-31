import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ProductCardProps {
  id?: string;
  imageSrc: string;
  /** Descriptive alt text combining material and product name, e.g. "Hand-loomed cotton throw blanket in cream" */
  altText?: string;
  title: string;
  price: number;
  description: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  imageSrc,
  altText,
  title,
  price,
  isFavorite: isFavoriteProp = false,
  onFavoriteToggle,
  className = '',
}) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp);
  const navigate = useNavigate();

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
    onFavoriteToggle?.();
  };

  return (
    <div
      onClick={() => id && navigate(`/product/${id}`)}
      data-cursor="explore"
      data-cursor-text="VIEW"
      className={`group flex flex-col cursor-pointer rounded-2xl transition-all duration-300 ${className}`}
    >
      {/* Image */}
      <div
        className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-4"
        style={{ backgroundColor: 'var(--border)' }}
      >
        <img
          src={imageSrc}
          alt={altText ?? title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover border overlay */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ border: '1px solid var(--accent)' }}
          aria-hidden="true"
        />

        {/* Heart / Save button — 44px touch target */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleFavorite}
            data-cursor="hidden"
            aria-label={isFavorite ? `Remove ${title} from saved` : `Save ${title}`}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-105"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: isFavorite ? 'var(--accent)' : 'var(--text-primary)' }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card content */}
      <div className="flex flex-col flex-1 px-1 pb-2">
        <div className="flex justify-between items-start mb-1 gap-4">
          {/* Product title: Fraunces 500, 20px */}
          <h3
            className="font-fraunces font-medium leading-snug flex-1"
            style={{ fontSize: '18px', color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
          {/* Price: Inter 600, aligned right */}
          <span
            className="font-sans font-bold text-[15px] shrink-0"
            style={{ color: 'var(--text-primary)' }}
          >
            ${price}
          </span>
        </div>
      </div>
    </div>
  );
};

