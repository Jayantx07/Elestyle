import React, { useState, useEffect } from 'react';
import { CartItemList, type CartItem } from '../components/organisms/CartItemList';
import { CartSummary } from '../components/organisms/CartSummary';
import { Typography } from '../components/atoms/Typography';

const DUMMY_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    title: 'BOMBER JACKET',
    originalPrice: 2728,
    price: 2318,
    color: { name: 'Black', hex: '#000000' },
    size: '46',
    quantity: 2,
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg' // Using available dummy image
  },
  {
    id: '2',
    title: 'TAILORED JACKET',
    price: 2728,
    color: { name: 'Gray', hex: '#808080' },
    size: '46',
    quantity: 2,
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_cover_chs6qs.jpg'
  },
  {
    id: '3',
    title: 'COAT',
    price: 649,
    color: { name: 'Gray', hex: '#E5E5E5' },
    size: '46',
    quantity: 2,
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg'
  },
  {
    id: '4',
    title: 'HIGH-NECK SWEATER',
    price: 600,
    color: { name: 'Cream', hex: '#FDFBF7' },
    size: '46',
    quantity: 1,
    imageSrc: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg'
  }
];

const CartPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>(DUMMY_CART_ITEMS);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout with ' + items.length + ' items!');
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
                items={items} 
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
