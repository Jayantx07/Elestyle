import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ListingProductCardProps {
  slug: string;
  imageSrc: string;
  altText?: string;
  category: string;
  title: string;
  rating: number;
  reviewsCount: number;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  isFavorite?: boolean;
}

export const ListingProductCard: React.FC<ListingProductCardProps> = ({
  slug,
  imageSrc,
  altText,
  category,
  title,
  rating,
  reviewsCount,
  price,
  originalPrice,
  discountBadge,
  isFavorite: isFavoriteProp = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp);
  const navigate = useNavigate();

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  return (
    <div
      onClick={() => navigate(`/product/${slug}`)}
      data-cursor="explore"
      data-cursor-text="VIEW"
      className="group flex flex-col cursor-pointer transition-all duration-300"
    >
      {/* Image Container */}
      <div
        className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-5 bg-black/5"
        style={{ border: '1px solid var(--border)' }}
      >
        <img
          src={imageSrc}
          alt={altText ?? title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        {discountBadge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#E56A54] text-white font-sans text-[11px] font-semibold tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              {discountBadge}
            </span>
          </div>
        )}

        {/* Heart / Save button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleFavorite}
            data-cursor="hidden"
            aria-label={isFavorite ? `Remove ${title} from saved` : `Save ${title}`}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-110"
          >
            <svg
              width="14"
              height="14"
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

      {/* Card Details */}
      <div className="flex flex-col flex-1 px-1">
        {/* Category */}
        <span
          className="font-sans text-[11px] font-semibold mb-1.5"
          style={{ color: 'var(--accent)' }}
        >
          {category}
        </span>
        
        {/* Title */}
        <h3
          className="font-fraunces font-medium text-[17px] leading-tight mb-2 transition-colors group-hover:opacity-80"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex gap-[2px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} width="10" height="10" viewBox="0 0 24 24" fill={star <= Math.round(rating) ? "#FACC15" : "none"} stroke="#FACC15" strokeWidth={star <= Math.round(rating) ? 0 : 2}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            ))}
          </div>
          <span className="font-sans text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            {rating} ({reviewsCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          <span
            className="font-sans font-semibold text-[15px]"
            style={{ color: 'var(--text-primary)' }}
          >
            ${price.toLocaleString()}
          </span>
          {originalPrice && (
            <span
              className="font-sans text-[13px] line-through"
              style={{ color: 'var(--text-secondary)' }}
            >
              ${originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
