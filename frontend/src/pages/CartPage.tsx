import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItemList } from '../components/organisms/CartItemList';
import { CartSummary } from '../components/organisms/CartSummary';
import { Typography } from '../components/atoms/Typography';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, subtotal, discount, shipping, tax, grandTotal, applyCoupon, coupon, couponError } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-28 pb-20 md:pt-36 md:pb-28 px-4 md:px-8" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-6xl mx-auto">
        <Typography variant="h1" className="sr-only">Shopping Cart</Typography>

        <div className="mb-8 md:mb-10">
          <p className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-black/35">
            Web / Shopping
          </p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 md:py-32 rounded-[28px] border border-black/5 bg-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.04)]">
            <Typography variant="h3" className="mb-4">Your cart is empty</Typography>
            <p className="font-sans text-sm text-gray-500 mb-8">Add some items to get started.</p>
            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center justify-center rounded-full bg-charcoal px-6 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)] gap-8 xl:gap-12 items-start">
            <div className="min-w-0">
              <CartItemList
                items={items}
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
              />
            </div>

            <div className="lg:sticky lg:top-24">
              <CartSummary
                items={items}
                subtotal={subtotal}
                discount={discount}
                shipping={shipping}
                tax={tax}
                grandTotal={grandTotal}
                coupon={coupon}
                couponError={couponError}
                onApplyCoupon={applyCoupon}
                onCheckout={handleCheckout}
                onContinueShopping={handleContinueShopping}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
