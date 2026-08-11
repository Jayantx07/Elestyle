import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { Typography } from '../atoms/Typography';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export interface ProductDetailSectionProps {
  product: {
    id: string;
    title: string;
    price: number;
    description: string;
    imageSrc: string;
    thumbnails: string[];
    mainNotes: string[];
    variants?: any[];
    handmadeTime?: string;
    countryOfOrigin?: string;
    material?: string;
    weight?: string;
    dimensions?: { length?: number; width?: number; height?: number; unit?: string };
    sku?: string;
    brand?: string;
    availability?: string;
    attributes?: { key: string; label: string; value: any }[];
    stock?: number;
    compareAtPrice?: number;
    lowStockAlertActive?: boolean;
    lowStockAlertThreshold?: number;
    lowStockAlertMessage?: string;
    paymentMethod?: string[];
    returnWarranty?: number;
  };
}

export const ProductDetailSection: React.FC<ProductDetailSectionProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.imageSrc);
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const isBaseVariant = selectedVariant && selectedVariant._id === 'base';
  
  const currentPrice = selectedVariant && !isBaseVariant && selectedVariant.price && selectedVariant.price > 0 ? selectedVariant.price : product.price;
  const currentTitle = selectedVariant && !isBaseVariant
    ? `${product.title} (${selectedVariant.name})`
    : product.title;

  const currentStock = selectedVariant && !isBaseVariant && selectedVariant.stock !== undefined ? selectedVariant.stock : product.stock;
  
  let currentAvailability = product.availability || 'In Stock';
  if (selectedVariant && !isBaseVariant) {
    if (selectedVariant.stock !== undefined && selectedVariant.stock <= 0 && currentAvailability !== 'Pre-Order') {
      currentAvailability = 'Out of Stock';
    } else if (selectedVariant.isAvailable === false) {
      currentAvailability = 'Out of Stock';
    }
  }

  const handleSelectVariant = (v: any) => {
    setSelectedVariant(v);
    const varImages = v.images && v.images.length > 0 ? v.images.map((i: any) => i.secure_url) : (v.image ? [v.image] : []);
    if (varImages.length > 0) {
      setActiveImage(varImages[0]);
    }
  };

  useEffect(() => {
    if (selectedVariant) {
      const varImages = selectedVariant.images && selectedVariant.images.length > 0 ? selectedVariant.images.map((i: any) => i.secure_url) : (selectedVariant.image ? [selectedVariant.image] : []);
      if (varImages.length > 0) {
        setActiveImage(varImages[0]);
      } else {
        setActiveImage(product.imageSrc);
      }
    } else {
      setActiveImage(product.imageSrc);
    }
  }, [product]);

  // Magnifier state
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
  const [showMagnifier, setShowMagnifier] = useState(false);
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(product.id);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const handleAddToCart = () => {
    addToCart({
      id: selectedVariant ? `${product.id}-${selectedVariant.name.replace(/\s+/g, '-')}` : product.id,
      title: currentTitle,
      price: currentPrice,
      imageSrc: product.imageSrc,
      quantity,
    });
  };

  const handleBuyNow = () => {
    sessionStorage.setItem('temp_checkout_session', JSON.stringify([{
      id: selectedVariant ? `${product.id}-${selectedVariant.name.replace(/\s+/g, '-')}` : product.id,
      title: currentTitle,
      price: currentPrice,
      imageSrc: product.imageSrc,
      quantity,
    }]));
    navigate('/checkout?session=temp');
  };

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        title: product.title,
        price: product.price,
        imageSrc: product.imageSrc,
      });
    }
  };

  return (
    <section className="py-12 md:py-20 px-4 max-w-7xl mx-auto w-full" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Left Column: Images */}
        <div className="flex flex-col gap-6">
          <div 
            className="w-full aspect-[4/5] lg:aspect-square rounded-[32px] overflow-hidden bg-black/5 relative cursor-zoom-in" 
            style={{ borderColor: 'var(--border)', borderWidth: '1px' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => !isTouchDevice && setShowMagnifier(true)}
            onMouseLeave={() => setShowMagnifier(false)}
          >
            <img 
              src={activeImage} 
              alt={product.title} 
              className={`w-full h-full object-cover transition-opacity duration-500 ${showMagnifier ? 'opacity-0' : 'opacity-100'}`}
            />
            {showMagnifier && !isTouchDevice && (
              <div 
                className="absolute inset-0 bg-no-repeat"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition,
                  backgroundSize: '200%', // Adjust scale for magnification
                }}
              />
            )}
          </div>
          {(() => {
            const variantImages = selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
              ? selectedVariant.images.map((i: any) => i.secure_url)
              : (selectedVariant && selectedVariant.image ? [selectedVariant.image, ...product.thumbnails.filter((t: string) => t !== selectedVariant.image)] : product.thumbnails);
            const displayThumbnails = variantImages && variantImages.length > 0 ? variantImages : product.thumbnails;
            
            return (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {displayThumbnails.map((thumb: string, idx: number) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(thumb)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all duration-300 border-2 ${activeImage === thumb ? 'border-[#03989E] opacity-100 shadow-sm scale-[1.02]' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col pt-4">
          <Typography variant="h2" className="mb-2">{product.title}</Typography>
          <div className="flex items-center gap-3 mb-6">
            <Typography variant="h5" className="font-sans font-bold text-[#03989E]">${currentPrice.toFixed(2)}</Typography>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <>
                <span className="text-gray-400 line-through text-sm font-semibold">${product.compareAtPrice.toFixed(2)}</span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                  {Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Availability & Low Stock Alert */}
          <div className="mb-6 flex flex-col gap-3">
            {/* Availability */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${currentAvailability === 'Out of Stock' ? 'bg-red-500' : currentAvailability === 'Pre-Order' ? 'bg-orange-400' : 'bg-green-500'}`}></span>
              <span className="text-sm font-semibold text-gray-700">{currentAvailability}</span>
            </div>

            {/* Low Stock Alert */}
            {product.lowStockAlertActive && currentStock !== undefined && currentStock > 0 && product.lowStockAlertThreshold !== undefined && currentStock <= product.lowStockAlertThreshold && currentAvailability !== 'Out of Stock' && (
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded-lg text-xs font-medium w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                {product.lowStockAlertMessage || "Order fast, stock is running low!"}
              </div>
            )}
          </div>

          {/* More Options / Visual Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3.5">
                <span className="text-base font-sans font-medium text-gray-900">More Options</span>
              </div>

              <div className="flex items-center flex-wrap gap-3">
                {product.variants.map((v, idx) => {
                  const isSelected = selectedVariant?._id === v._id || selectedVariant?.name === v.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectVariant(v)}
                      title={`${v.name}${(!v.isBase && v.price > 0) ? ` - $${v.price}` : ''}`}
                      className={`transition-all relative rounded-xl overflow-hidden flex items-center justify-center ${
                        v.image
                          ? `w-[76px] h-[98px] p-1 ${
                              isSelected
                                ? 'border-[2.5px] border-[#03989E] bg-white shadow-md shadow-[#03989E]/10 scale-[1.03]'
                                : 'border border-gray-300 bg-gray-50 opacity-85 hover:opacity-100 hover:border-gray-400'
                            }`
                          : `px-4 py-2.5 text-sm font-semibold border-2 rounded-xl gap-2 ${
                              isSelected
                                ? 'border-[#03989E] bg-[#03989E]/10 text-[#03989E] shadow-xs'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`
                      }`}
                    >
                      {v.image ? (
                        <img src={v.image} alt={v.name} className="w-full h-full object-cover rounded-lg aspect-[3/4]" />
                      ) : (
                        <>
                          {v.colorHex && (
                            <span
                              className="w-3.5 h-3.5 rounded-full inline-block border border-gray-300 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: v.colorHex }}
                            />
                          )}
                          <span className="truncate">{v.name}</span>
                          {v.price > 0 && v.price !== product.price && (
                            <span className="text-xs font-normal opacity-80 flex-shrink-0">(${v.price})</span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description Accordion */}
          <div className="rounded-2xl mb-6 overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setIsDescOpen(!isDescOpen)}
              className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-black/5"
            >
              <span className="font-sans font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Description</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isDescOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-primary)' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ${isDescOpen ? 'max-h-96 pb-6' : 'max-h-0 pb-0'}`}>
              <p className="font-sans text-[14px] leading-relaxed pt-2" style={{ color: 'var(--text-secondary)' }}>
                {product.description}
              </p>
            </div>
          </div>

          {/* Specifications Accordion */}
          <div className="rounded-2xl mb-8 overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
            <button 
              className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-black/5"
              onClick={() => {
                const el = document.getElementById('specifications-content');
                if (el) {
                  const isOpen = el.style.maxHeight !== '0px' && el.style.maxHeight !== '';
                  el.style.maxHeight = isOpen ? '0px' : '500px';
                  el.style.paddingBottom = isOpen ? '0px' : '24px';
                  const icon = document.getElementById('specifications-icon');
                  if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                }
              }}
            >
              <span className="font-sans font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Specifications</span>
              <svg id="specifications-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300" style={{ color: 'var(--text-primary)', transform: 'rotate(180deg)' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div id="specifications-content" className="px-6 overflow-hidden transition-all duration-300" style={{ maxHeight: '500px', paddingBottom: '24px' }}>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2 text-[13px] font-sans">
                {product.brand && (
                  <div><span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-0.5">Brand</span><span className="font-medium text-gray-800">{product.brand}</span></div>
                )}
                {product.sku && (
                  <div><span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-0.5">SKU</span><span className="font-medium text-gray-800">{product.sku}</span></div>
                )}
                {product.material && (
                  <div><span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-0.5">Material</span><span className="font-medium text-gray-800">{product.material}</span></div>
                )}
                {product.weight && (
                  <div><span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-0.5">Weight</span><span className="font-medium text-gray-800">{product.weight}</span></div>
                )}
                {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
                  <div><span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-0.5">Dimensions</span><span className="font-medium text-gray-800">{product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} {product.dimensions.unit || 'cm'}</span></div>
                )}
                {product.countryOfOrigin && (
                  <div><span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-0.5">Origin</span><span className="font-medium text-gray-800">{product.countryOfOrigin}</span></div>
                )}
                {product.handmadeTime && (
                  <div><span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-0.5">Crafting Time</span><span className="font-medium text-gray-800">{product.handmadeTime}</span></div>
                )}
                {product.attributes && product.attributes.map((attr, idx) => (
                  <div key={idx}><span className="text-gray-500 block text-[11px] uppercase tracking-wider mb-0.5">{attr.label}</span><span className="font-medium text-gray-800">{String(attr.value)}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Notes */}
          <div className="mb-10">
            <Typography variant="subtitle" className="mb-4 block tracking-wide text-[11px]" style={{ color: 'var(--text-primary)' }}>Main Notes</Typography>
            <div className="flex flex-wrap gap-3">
              {product.mainNotes.map((note, idx) => (
                <span 
                  key={idx} 
                  className="font-sans text-[13px] px-5 py-2 rounded-full border transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* Quantity & Buttons */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-[#03989E] text-white rounded-md transition-opacity hover:opacity-80"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span className="w-12 text-center font-sans font-medium text-[15px]" style={{ color: 'var(--text-primary)' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-[#03989E] text-white rounded-md transition-opacity hover:opacity-80"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button onClick={handleAddToCart} variant="outline" className={`flex-1 rounded-full border ${product.availability === 'Out of Stock' ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-black/20 hover:border-black/50'} text-primary`} disabled={product.availability === 'Out of Stock'}>
                {product.availability === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button onClick={handleBuyNow} variant="primary" className={`flex-1 rounded-full text-white border-none ${product.availability === 'Out of Stock' ? 'bg-gray-400 cursor-not-allowed' : ''}`} disabled={product.availability === 'Out of Stock'}>
                Buy Now
              </Button>
              <button 
                onClick={toggleWishlist}
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full border border-black/20 hover:border-black/50 transition-colors"
                aria-label="Toggle wishlist"
                style={{ color: inWishlist ? 'red' : 'var(--text-primary)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? "red" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Delivery Options Accordion */}
          <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
              className="w-full flex items-center justify-between px-6 py-4 transition-colors hover:bg-black/5"
            >
              <span className="font-sans font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>Delivery Options</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isDeliveryOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-primary)' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-300 ${isDeliveryOpen ? 'max-h-96 pb-6' : 'max-h-0 pb-0'}`}>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-2">
                
                {/* Discount */}
                <div className="flex items-start gap-3">
                  <div className="mt-[2px]" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8L8 16"></path><circle cx="9" cy="9" r="1"></circle><circle cx="15" cy="15" r="1"></circle></svg>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] uppercase tracking-[0.05em] mb-1" style={{ color: 'var(--text-secondary)' }}>Discount</p>
                    <p className="font-sans text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>
                      {product.compareAtPrice && product.compareAtPrice > currentPrice ? `Disc ${Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)}%` : 'No Discount'}
                    </p>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-start gap-3">
                  <div className="mt-[2px]" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] uppercase tracking-[0.05em] mb-1" style={{ color: 'var(--text-secondary)' }}>Payment</p>
                    <div className="font-sans text-[13px] font-medium leading-tight pr-4 flex flex-col items-center" style={{ color: 'var(--text-primary)' }}>
                      {(product.paymentMethod && product.paymentMethod.length > 0) ? 
                        product.paymentMethod.map((method, i) => (
                          <span key={i} className="flex flex-col items-center">
                            <span>{method}</span>
                            {i < product.paymentMethod!.length - 1 && (
                              <span className="text-[11px] text-gray-400 my-0.5">&</span>
                            )}
                          </span>
                        ))
                        : <span>Cash on Delivery Available</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="flex items-start gap-3">
                  <div className="mt-[2px]" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] uppercase tracking-[0.05em] mb-1" style={{ color: 'var(--text-secondary)' }}>Delivery Time</p>
                    <p className="font-sans text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{product.handmadeTime || '3-4 Working Days'}</p>
                  </div>
                </div>

                {/* Return */}
                <div className="flex items-start gap-3">
                  <div className="mt-[2px]" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m0 0l4 4m-4-4l4-4"></path></svg>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] uppercase tracking-[0.05em] mb-1" style={{ color: 'var(--text-secondary)' }}>Return & Warranty</p>
                    <p className="font-sans text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{product.returnWarranty ?? 7} Days easy return</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
