import React from 'react';

export interface CartItem {
  id: string;
  imageSrc: string;
  title: string;
  originalPrice?: number;
  price: number;
  color?: { name: string; hex: string };
  size?: string;
  quantity: number;
}

export interface CartItemListProps {
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

export const CartItemList: React.FC<CartItemListProps> = ({ items, onRemove, onUpdateQuantity }) => {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      <div className="hidden md:grid grid-cols-[96px_minmax(0,1fr)_auto_auto_auto] gap-6 px-8 py-5 border-b border-black/5 text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">
        <span>Item</span>
        <span>Details</span>
        <span className="text-center">Quantity</span>
        <span className="text-right">Total</span>
        <span className="text-right">Remove</span>
      </div>

      <div className="divide-y divide-black/5">
        {items.map((item) => {
          const rowTotal = item.price * item.quantity;

          return (
            <div key={item.id} className="px-4 py-5 md:px-8 md:py-7">
              <div className="flex gap-4 md:hidden">
                <div className="w-20 shrink-0 overflow-hidden rounded-[24px] bg-black/5 border border-black/5 flex items-center justify-center aspect-square p-2">
                  <img src={item.imageSrc} alt={item.title} className="h-full w-full object-cover mix-blend-multiply" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-fraunces text-[18px] leading-snug text-charcoal">
                    {item.title}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[12px] text-black/45">
                    {item.color?.name && <span>{item.color.name}</span>}
                    {item.size && <span>{item.size}</span>}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 rounded-full border border-black/10 px-3 py-1.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1 text-black/55 transition-opacity hover:text-black"
                        aria-label={`Decrease quantity of ${item.title}`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <div className="min-w-5 text-center font-sans text-[13px] font-medium text-charcoal">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-black/55 transition-opacity hover:text-black"
                        aria-label={`Increase quantity of ${item.title}`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[13px] font-medium text-charcoal">
                        {formatPrice(rowTotal)}
                      </span>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/45 transition-colors hover:border-black/20 hover:text-black"
                        aria-label="Remove item"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-[96px_minmax(0,1fr)_auto_auto_auto] gap-6 items-center">
                <div className="w-24 aspect-square overflow-hidden rounded-[24px] bg-black/5 border border-black/5 flex items-center justify-center p-2">
                  <img src={item.imageSrc} alt={item.title} className="h-full w-full object-cover mix-blend-multiply" />
                </div>

                <div className="min-w-0 pr-4">
                  <h3 className="font-fraunces text-[23px] leading-tight text-charcoal">
                    {item.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-[12px] uppercase tracking-[0.12em] text-black/45">
                    {item.color?.name && <span>{item.color.name}</span>}
                    {item.size && <span>{item.size}</span>}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {item.originalPrice && (
                      <span className="font-sans text-[14px] text-black/35 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                    <span className="font-sans text-[14px] text-black/70">
                      Unit price {formatPrice(item.price)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex items-center gap-3 rounded-full border border-black/10 px-3 py-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 text-black/55 transition-opacity hover:text-black"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <div className="min-w-6 text-center font-sans text-[13px] font-medium text-charcoal">
                      {item.quantity}
                    </div>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-black/55 transition-opacity hover:text-black"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-sans text-[14px] font-medium text-charcoal">
                    {formatPrice(rowTotal)}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/45 transition-colors hover:border-black/20 hover:text-black"
                    aria-label="Remove item"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
