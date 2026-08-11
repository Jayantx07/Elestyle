import React from 'react';
import { Button } from '../atoms/Button';
import type { CartItem } from '../../contexts/CartContext';

export interface CartSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  coupon: string | null;
  couponError: string | null;
  onApplyCoupon: (code: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  subtotal,
  discount,
  shipping,
  tax,
  grandTotal,
  coupon,
  couponError,
  onApplyCoupon,
  onCheckout,
  onContinueShopping,
}) => {
  const [couponInput, setCouponInput] = React.useState(coupon || '');
  
  React.useEffect(() => {
    setCouponInput(coupon || '');
  }, [coupon]);
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <aside className="rounded-[28px] border border-black/5 bg-white/80 p-5 md:p-7 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.24em] text-black/35 mb-3">Summary</p>
          <h2 className="font-fraunces text-[26px] leading-none text-charcoal">Order Summary</h2>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-6 text-[13px] text-black/55">
          <span className="font-sans uppercase tracking-[0.16em]">Subtotal</span>
          <span className="font-sans font-medium text-charcoal">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between gap-6 text-[13px] text-green-600">
            <span className="font-sans uppercase tracking-[0.16em]">Discount</span>
            <span className="font-sans font-medium">-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-6 text-[13px] text-black/55">
          <span className="font-sans uppercase tracking-[0.16em]">Shipping</span>
          <span className="font-sans font-medium text-charcoal">{formatPrice(shipping)}</span>
        </div>
        <div className="flex items-center justify-between gap-6 text-[13px] text-black/55">
          <span className="font-sans uppercase tracking-[0.16em]">Taxes</span>
          <span className="font-sans font-medium text-charcoal">{formatPrice(tax)}</span>
        </div>
      </div>

      <div className="my-7 h-px bg-black/5" />

      <div className="flex items-end justify-between gap-6">
        <span className="font-sans text-[13px] uppercase tracking-[0.18em] text-black/60">Total</span>
        <span className="font-fraunces text-[30px] leading-none text-charcoal">
          {formatPrice(grandTotal)}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Coupon Code" 
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-full border border-black/10 focus:outline-none focus:border-black text-[13px]"
          />
          <Button variant="outline" onClick={() => onApplyCoupon(couponInput)} className="rounded-full px-6">Apply</Button>
        </div>
        {couponError && <p className="text-red-500 text-xs px-4">{couponError}</p>}
      </div>

      <div className="mt-8 space-y-3">
        <Button
          variant="secondary"
          className="w-full rounded-full px-6 py-4 text-[11px] tracking-[0.2em] text-white"
          style={{ backgroundColor: '#03989E' }}
          onClick={onCheckout}
        >
          Proceed to Checkout
        </Button>

        <Button
          variant="ghost"
          className="w-full rounded-full border border-black/10 px-6 py-4 text-[11px] tracking-[0.2em] text-charcoal hover:bg-black/5"
          onClick={onContinueShopping}
        >
          Continue Shopping
        </Button>
      </div>

      <div className="mt-8 rounded-[22px] border border-black/5 bg-black/[0.02] px-5 py-4">
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-black/35">Need help?</p>
        <p className="mt-2 font-sans text-[13px] leading-relaxed text-black/50">
          Your order details are reviewed before checkout so the final total stays clear and easy to scan.
        </p>
      </div>

      <div className="sr-only">
        {items.map((item) => (
          <span key={item.id}>{item.title} {item.quantity}</span>
        ))}
      </div>
    </aside>
  );
};
