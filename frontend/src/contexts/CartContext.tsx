import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string; // Product ID
  title: string;
  price: number;
  imageSrc: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  coupon: string | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupon, setCoupon] = useState<string | null>(() => {
    return localStorage.getItem('cart_coupon') || null;
  });
  const { user } = useAuth();
  const [hasMerged, setHasMerged] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    if (coupon) localStorage.setItem('cart_coupon', coupon);
    else localStorage.removeItem('cart_coupon');
  }, [items, coupon]);

  useEffect(() => {
    if (user && !hasMerged) {
      console.log('Merging local cart to DB for user:', user.email);
      // Here you would call a backend API to push local items to the DB
      // Then clear local storage and fetch DB cart.
      // e.g. api.mergeCart(items).then(dbCart => setItems(dbCart));
      setHasMerged(true);
    }
    if (!user) {
      setHasMerged(false);
    }
  }, [user, items, hasMerged]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Basic mock discount logic on frontend to match backend logic
  const discountAmount = coupon === 'DISCOUNT10' ? subtotal * 0.1 : 0;
  
  const shipping = 0;
  const tax = 0;
  const grandTotal = subtotal - discountAmount + shipping + tax;

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) => 
          i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    setItems((prev) => 
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const applyCoupon = (code: string) => {
    setCoupon(code);
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount: discountAmount,
        shipping,
        tax,
        grandTotal,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
