import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';

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
  addToCart: (item: CartItem) => Promise<void> | void;
  removeFromCart: (id: string) => Promise<void> | void;
  updateQuantity: (id: string, quantity: number) => Promise<void> | void;
  applyCoupon: (code: string) => void;
  clearCart: () => Promise<void> | void;
  loading: boolean;
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
  const { user, accessToken } = useAuth();
  const [hasMerged, setHasMerged] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync with local storage if not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, user]);

  useEffect(() => {
    if (coupon) localStorage.setItem('cart_coupon', coupon);
    else localStorage.removeItem('cart_coupon');
  }, [coupon]);

  const formatAndSetCart = (dbCart: any) => {
    if (!dbCart || !dbCart.items) return setItems([]);
    
    const formattedItems = dbCart.items.map((item: any) => {
      const product = item.product || {};
      return {
        id: product._id || item.product,
        title: product.name || 'Unknown Product',
        price: item.price || product.price || 0,
        imageSrc: product.images?.[0]?.secure_url || '',
        quantity: item.quantity
      };
    });
    setItems(formattedItems);
  };

  // Load and merge cart on login
  useEffect(() => {
    const initCart = async () => {
      if (user && accessToken && !hasMerged) {
        setLoading(true);
        try {
          const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
          
          if (localItems.length > 0) {
            console.log('Merging local cart to DB for user:', user.email);
            const res = await cartService.mergeCart(localItems, accessToken);
            if (res.success && res.data) {
              localStorage.removeItem('cart');
              formatAndSetCart(res.data);
            }
          } else {
            const res = await cartService.getCart(accessToken);
            if (res.success && res.data) {
              formatAndSetCart(res.data);
            }
          }
          setHasMerged(true);
        } catch (err) {
          console.error('Failed to sync cart:', err);
        } finally {
          setLoading(false);
        }
      }
      if (!user) {
        setHasMerged(false);
      }
    };
    initCart();
  }, [user, accessToken, hasMerged]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Basic mock discount logic on frontend to match backend logic
  const discountAmount = coupon === 'DISCOUNT10' ? subtotal * 0.1 : 0;
  
  const shipping = 0;
  const tax = 0;
  const grandTotal = subtotal - discountAmount + shipping + tax;

  const addToCart = async (newItem: CartItem) => {
    if (user && accessToken) {
      try {
        const res = await cartService.addToCart(
          { productId: newItem.id, quantity: newItem.quantity, price: newItem.price },
          accessToken
        );
        if (res.success) formatAndSetCart(res.data);
      } catch (err) {
        console.error('Failed to add to cart:', err);
      }
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === newItem.id);
        if (existing) {
          return prev.map((i) => 
            i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
          );
        }
        return [...prev, newItem];
      });
    }
  };

  const removeFromCart = async (id: string) => {
    if (user && accessToken) {
      try {
        const res = await cartService.removeFromCart(id, accessToken);
        if (res.success) formatAndSetCart(res.data);
      } catch (err) {
        console.error('Failed to remove from cart:', err);
      }
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id);
    
    if (user && accessToken) {
      try {
        const res = await cartService.updateQuantity(id, quantity, accessToken);
        if (res.success) formatAndSetCart(res.data);
      } catch (err) {
        console.error('Failed to update cart quantity:', err);
      }
    } else {
      setItems((prev) => 
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  const applyCoupon = (code: string) => {
    setCoupon(code);
  };

  const clearCart = async () => {
    if (user && accessToken) {
      try {
        const res = await cartService.clearCart(accessToken);
        if (res.success) formatAndSetCart(res.data);
      } catch (err) {
        console.error('Failed to clear cart:', err);
      }
    } else {
      setItems([]);
    }
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
        loading
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
