import React from 'react';
import { Button } from '../atoms/Button';
import type { CartItem } from '../../contexts/CartContext';

export interface CartSummaryProps {
  items: CartItem[];
  onCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ items, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-transparent md:bg-black/5 p-2 md:p-6 lg:p-8 sticky top-24">
      
      <h2 className="font-fraunces font-medium text-lg uppercase tracking-wide mb-6" style={{ color: 'var(--text-primary)' }}>
        Order Summary
      </h2>

      {/* Item Breakdown */}
      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-start gap-4">
            <span className="font-sans text-[11px] uppercase tracking-wide leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {item.title} {item.quantity > 1 && <span className="opacity-60 lowercase">x{item.quantity}</span>}
            </span>
            <span className="font-sans text-[12px] font-medium shrink-0" style={{ color: 'var(--text-primary)' }}>
              ${(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-black/20 mb-6" />

      {/* Tax */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-sans text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
          SALES TAX
        </span>
        <span className="font-sans text-[12px] lowercase" style={{ color: 'var(--text-primary)' }}>
          Included
        </span>
      </div>

      <div className="w-full h-px bg-black/20 mb-6" />

      {/* Total */}
      <div className="flex justify-between items-center mb-10">
        <span className="font-sans text-[12px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
          TOTAL
        </span>
        <span className="font-sans text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          ${total.toLocaleString()}
        </span>
      </div>

      {/* Checkout Button */}
      <Button 
        variant="secondary" 
        className="w-full bg-black hover:bg-black/80 rounded-none h-12 text-[11px] tracking-widest"
        onClick={onCheckout}
      >
        PROCEED TO CHECKOUT
      </Button>

    </div>
  );
};
