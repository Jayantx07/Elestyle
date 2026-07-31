import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItemList } from '../components/organisms/CartItemList';
import { CartSummary } from '../components/organisms/CartSummary';
import { Typography } from '../components/atoms/Typography';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity } = useCart();
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

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40 px-4 md:px-8" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Optional Page Title (can be hidden if Navbar implies it, but good for accessibility) */}
        <Typography variant="h1" className="sr-only">Shopping Cart</Typography>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Typography variant="h3" className="mb-4">Your cart is empty</Typography>
            <p className="font-sans text-sm text-gray-500 mb-8">Add some items to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24 relative items-start">
            
            {/* Left: Cart Items */}
            <div className="lg:col-span-7 xl:col-span-8">
              <CartItemList 
                items={items.map(item => ({
                  ...item,
                  color: { name: 'Default', hex: '#000000' }, // Mocking required fields
                  size: 'OS'
                }))} 
                onRemove={handleRemove} 
                onUpdateQuantity={handleUpdateQuantity} 
              />
            </div>

            {/* Right: Summary Box */}
            <div className="lg:col-span-5 xl:col-span-4">
              <CartSummary 
                items={items} 
                onCheckout={handleCheckout} 
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
