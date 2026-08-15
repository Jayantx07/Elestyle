import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';

// Icons
const HeartIcon = ({ isFavorite }: { isFavorite?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export interface ProductCardProps {
  id?: string;
  imageSrc?: string;
  altText?: string;
  title?: string;
  price?: number;
  description?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  className?: string;
  product?: any; // The full product object for advanced features (swatches, discount, subcategory)
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  imageSrc,
  altText,
  title,
  price,
  className = '',
  product,
}) => {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Extract variables, preferring the 'product' object if available
  const finalId = product?.slug || id || '';
  const finalTitle = product?.name || title || '';
  const finalPrice = product?.price ?? price ?? 0;
  const finalImage = product?.images?.[0]?.secure_url || imageSrc || 'https://images.unsplash.com/photo-1584992236310-6edddc085ffb?w=500';
  const finalAltText = altText || finalTitle;

  const isFav = isInWishlist(finalId);

  return (
    <div className={`group flex flex-col relative bg-white rounded-lg p-3 border border-gray-100/80 shadow-2xs hover:shadow-md hover:border-[#03989E]/50 transition-all duration-300 ${className}`}>
      <div
        className="relative aspect-[4/5] mb-3.5 overflow-hidden rounded-md flex items-center justify-center bg-[#FAF8F5] cursor-pointer"
        onClick={() => navigate(`/product/${finalId}`)}
      >
        <img
          src={finalImage}
          alt={finalAltText}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product?.discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#1F1F1F] text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider shadow-sm">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist Heart Overlay */}
        <button
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-sm hover:bg-white transition-colors text-gray-700 hover:text-red-500"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isFav) {
              removeFromWishlist(finalId);
            } else {
              addToWishlist({
                id: finalId,
                title: finalTitle,
                price: finalPrice,
                imageSrc: finalImage,
              });
            }
          }}
        >
          <HeartIcon isFavorite={isFav} />
        </button>
      </div>

      <div className="px-1 flex flex-col flex-1 justify-between cursor-pointer" onClick={() => navigate(`/product/${finalId}`)}>
        <div>
          {/* SubCategory chip label */}
          {product?.subCategory && (
            <span className="text-[11px] uppercase tracking-wider text-[#03989E] font-semibold block mb-1">
              {typeof product.subCategory === 'object' ? product.subCategory.name : product.subCategory}
            </span>
          )}
          <h3 className="text-[15px] font-sans font-medium text-gray-900 group-hover:text-[#03989E] transition-colors line-clamp-1 mb-1">
            {finalTitle}
          </h3>
        </div>

        <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">₹{finalPrice}</span>
            {product?.compareAtPrice && product.compareAtPrice > finalPrice && (
              <span className="text-xs text-gray-400 line-through">₹{product.compareAtPrice}</span>
            )}
          </div>

          {/* Color Swatch Dots Preview on Card */}
          {(() => {
            if (!product) return null;
            const allColorsMap = new Map();
            
            // 1. Base color (from attributes)
            const attrColor = product.attributes?.find((a: any) => a.key.toLowerCase() === 'color' || a.key.toLowerCase() === 'basecolor');
            const attrColorHex = product.attributes?.find((a: any) => a.key.toLowerCase() === 'basecolorhex')?.value;
            
            if (attrColor || attrColorHex) {
              const baseColorName = attrColor?.value || 'Base';
              const matchingSavedColor = product.colors?.find((c: any) => c.name.toLowerCase() === baseColorName.toLowerCase());
              const finalHex = attrColorHex || matchingSavedColor?.hex || '#e5e7eb';
              allColorsMap.set(baseColorName.toLowerCase(), { name: baseColorName, hex: finalHex });
            }

            // 2. Variant colors
            if (product.variants && Array.isArray(product.variants)) {
              product.variants.forEach((v: any) => {
                if (v.isActive !== false && v.colorName) {
                  allColorsMap.set(v.colorName.toLowerCase(), { name: v.colorName, hex: v.colorHex || '#000' });
                }
              });
            }

            // 3. Fallback to product.colors
            if (product.colors && Array.isArray(product.colors)) {
              product.colors.forEach((c: any) => {
                if (!allColorsMap.has(c.name.toLowerCase())) {
                  allColorsMap.set(c.name.toLowerCase(), { name: c.name, hex: c.hex });
                }
              });
            }

            const compiledColors = Array.from(allColorsMap.values());
            if (compiledColors.length === 0) return null;

            return (
              <div className="flex items-center gap-1">
                {compiledColors.slice(0, 3).map((c, i) => (
                  <span key={i} className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} title={c.name} />
                ))}
                {compiledColors.length > 3 && <span className="text-[10px] text-gray-400 font-mono">+{compiledColors.length - 3}</span>}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};


