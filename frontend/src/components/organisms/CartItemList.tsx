import React from 'react';

export interface CartItem {
  id: string;
  imageSrc: string;
  title: string;
  originalPrice?: number;
  price: number;
  color: { name: string; hex: string };
  size: string;
  quantity: number;
}

export interface CartItemListProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

export const CartItemList: React.FC<CartItemListProps> = ({ items, onRemove, onUpdateQuantity }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="hidden md:block w-full h-px bg-black/20 mb-8" />
      
      {items.map((item) => (
        <React.Fragment key={item.id}>
          {/* Mobile and Desktop Wrapper */}
          <div className="flex flex-row gap-4 md:gap-12 py-4 md:py-0 md:pb-8 relative border-b md:border-b-0 border-black/10 md:border-transparent">
            
            {/* Desktop Remove Button (Top Right) */}
            <button 
              onClick={() => onRemove(item.id)}
              className="hidden md:block absolute top-0 right-0 p-1 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Remove item"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Image */}
            <div className="w-24 md:w-48 shrink-0 aspect-square md:aspect-[4/5] bg-black/5 overflow-hidden flex items-center justify-center border border-black/5 md:border-none p-2 md:p-0">
              <img src={item.imageSrc} alt={item.title} className="max-w-full max-h-full object-cover mix-blend-multiply" />
            </div>

            {/* Details */}
            <div className="flex flex-col flex-1 pt-1 md:pr-8">
              
              {/* Title & Mobile Price Row */}
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-fraunces font-medium text-[15px] md:text-2xl uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                {/* Mobile Price */}
                <div className="flex items-center gap-1.5 md:hidden">
                  {item.originalPrice && (
                    <span className="font-sans text-[11px] line-through opacity-40" style={{ color: 'var(--text-primary)' }}>
                      ${item.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="font-sans text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    ${item.price.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Desktop Price */}
              <div className="hidden md:flex items-center gap-2 mb-8">
                {item.originalPrice && (
                  <span className="font-sans text-base line-through opacity-40" style={{ color: 'var(--text-primary)' }}>
                    ${item.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="font-sans text-base" style={{ color: 'var(--text-primary)' }}>
                  ${item.price.toLocaleString()}
                </span>
              </div>

              {/* Options */}
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 mb-4 md:mb-8">
                {/* Color/Variant (Mobile shows simple text, Desktop shows detailed selectors) */}
                <span className="md:hidden font-sans text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {item.color.name}
                </span>

                {/* Desktop detailed options */}
                <div className="hidden md:flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3 border-b border-black/20 pb-1 cursor-pointer hover:border-black/50 transition-colors">
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color.hex }} />
                    <span className="font-sans text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{item.color.name}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  
                  <div className="flex items-center gap-3 border-b border-black/20 pb-1 cursor-pointer hover:border-black/50 transition-colors px-2">
                    <span className="font-sans text-[11px] uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{item.size}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quantity & Actions (Mobile bottom row vs Desktop quantity) */}
              <div className="flex items-center justify-between mt-auto">
                
                {/* Quantity */}
                <div className="flex items-center gap-4 md:gap-6">
                  <span className="hidden md:block font-sans text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>
                    QUANTITY
                  </span>
                  
                  {/* Mobile Pill Style vs Desktop Block Style */}
                  <div className="flex items-center gap-3 md:gap-2 border md:border-0 rounded-full md:rounded-none px-3 py-1 md:p-0" style={{ borderColor: 'var(--border)' }}>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <div className="w-4 md:w-6 md:h-6 flex items-center justify-center font-sans text-[13px] md:text-[12px] md:font-medium leading-none md:bg-black md:text-white pt-px">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Mobile Actions (Heart & Trash) */}
                <div className="flex md:hidden items-center gap-3">
                  <button className="p-1 opacity-60 hover:opacity-100 transition-opacity">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                  <button onClick={() => onRemove(item.id)} className="p-1 opacity-60 hover:opacity-100 transition-opacity">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
          
          <div className="hidden md:block w-full h-px bg-black/20 mb-8" />
        </React.Fragment>
      ))}
    </div>
  );
};
