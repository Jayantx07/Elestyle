import React, { useState } from 'react';
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
  };
}

export const ProductDetailSection: React.FC<ProductDetailSectionProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.imageSrc);
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(true);

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
      id: product.id,
      title: product.title,
      price: product.price,
      imageSrc: product.imageSrc,
      quantity,
    });
  };

  const handleBuyNow = () => {
    sessionStorage.setItem('temp_checkout_session', JSON.stringify([{
      id: product.id,
      title: product.title,
      price: product.price,
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
          <div className="grid grid-cols-3 gap-4">
            {product.thumbnails.map((thumb, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(thumb)}
                className={`aspect-square rounded-2xl overflow-hidden transition-all duration-300 border-2 ${activeImage === thumb ? 'border-[var(--text-primary)] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="flex flex-col pt-4">
          <Typography variant="h2" className="mb-2">{product.title}</Typography>
          <Typography variant="h5" className="mb-8 font-sans font-bold">${product.price.toFixed(2)}</Typography>

          {/* Description Accordion */}
          <div className="rounded-2xl mb-8 overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)' }}>
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
                  className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-md transition-opacity hover:opacity-80"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
                <span className="w-12 text-center font-sans font-medium text-[15px]" style={{ color: 'var(--text-primary)' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-md transition-opacity hover:opacity-80"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button onClick={handleAddToCart} variant="outline" className="flex-1 rounded-full border border-black/20 hover:border-black/50" style={{ color: 'var(--text-primary)' }}>
                Add to Cart
              </Button>
              <Button onClick={handleBuyNow} variant="secondary" className="flex-1 rounded-full bg-black text-white">
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
                    <p className="font-sans text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>Disc 15%</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-start gap-3">
                  <div className="mt-[2px]" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] uppercase tracking-[0.05em] mb-1" style={{ color: 'var(--text-secondary)' }}>Payment</p>
                    <p className="font-sans text-[13px] font-medium leading-tight pr-4" style={{ color: 'var(--text-primary)' }}>Cash on Delivery Available</p>
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="flex items-start gap-3">
                  <div className="mt-[2px]" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] uppercase tracking-[0.05em] mb-1" style={{ color: 'var(--text-secondary)' }}>Delivery Time</p>
                    <p className="font-sans text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>3-4 Working Days</p>
                  </div>
                </div>

                {/* Return */}
                <div className="flex items-start gap-3">
                  <div className="mt-[2px]" style={{ color: 'var(--text-secondary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m0 0l4 4m-4-4l4-4"></path></svg>
                  </div>
                  <div>
                    <p className="font-sans text-[11px] uppercase tracking-[0.05em] mb-1" style={{ color: 'var(--text-secondary)' }}>Return & Warranty</p>
                    <p className="font-sans text-[13px] font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>7 Days easy return</p>
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
