// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  couponError: string | null;
  addToCart: (item: CartItem) => Promise<void> | void;
  removeFromCart: (id: string) => Promise<void> | void;
  updateQuantity: (id: string, quantity: number) => Promise<void> | void;
  applyCoupon: (code: string) => Promise<void>;
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
  
  const [pricingData, setPricingData] = useState<{ discount: number, shipping: number, tax: number, grandTotal?: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

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
        price: product.price || 0, // Enforce product price over item price
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

  // Revalidate coupon whenever items or user changes
  const validationDebounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const validate = async () => {
      if (!coupon || items.length === 0) {
        setPricingData(null);
        setCouponError(null);
        return;
      }
      
      try {
        const payloadItems = items.map(i => ({ productId: i.id, quantity: i.quantity }));
        const res = await cartService.validateCoupon(coupon, payloadItems, accessToken);
        
        if (res.success && res.data?.valid) {
          setPricingData({
            discount: res.data.pricing.discount,
            shipping: res.data.pricing.shipping,
            tax: res.data.pricing.tax,
            grandTotal: res.data.pricing.grandTotal
          });
          setCouponError(null);
        } else {
          setPricingData(null);
          setCouponError(res.message || 'Coupon is invalid for this cart.');
          setCoupon(null); // Clear invalid coupon
        }
      } catch (err: any) {
        setPricingData(null);
        setCouponError(err.message || 'Failed to validate coupon.');
        setCoupon(null);
      }
    };

    if (validationDebounceRef.current) {
      clearTimeout(validationDebounceRef.current);
    }
    
    // Debounce to prevent rapid calls when changing quantities
    validationDebounceRef.current = setTimeout(validate, 400);

    return () => {
      if (validationDebounceRef.current) clearTimeout(validationDebounceRef.current);
    };
  }, [items, coupon, accessToken]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const baseSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  const discountAmount = pricingData ? pricingData.discount : 0;
  const shipping = pricingData ? pricingData.shipping : 0;
  const tax = pricingData ? pricingData.tax : 0;
  
  const grandTotal = pricingData && pricingData.grandTotal !== undefined 
    ? pricingData.grandTotal 
    : (baseSubtotal + shipping + tax - discountAmount);

  const addToCart = async (newItem: CartItem) => {
    if (user && accessToken) {
      try {
        // Exclude price from payload since backend is authoritative
        const res = await cartService.addToCart(
          { productId: newItem.id, quantity: newItem.quantity },
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

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    if (!code) {
      setCoupon(null);
      return;
    }
    
    const payloadItems = items.map(i => ({ productId: i.id, quantity: i.quantity }));
    try {
      const res = await cartService.validateCoupon(code, payloadItems, accessToken);
      if (res.success && res.data?.valid) {
        setCoupon(code);
        setPricingData({
          discount: res.data.pricing.discount,
          shipping: res.data.pricing.shipping,
          tax: res.data.pricing.tax,
          grandTotal: res.data.pricing.grandTotal
        });
      } else {
        setCouponError(res.message || 'Coupon is invalid for this cart.');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon.');
    }
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
        subtotal: baseSubtotal,
        discount: discountAmount,
        shipping,
        tax,
        grandTotal,
        coupon,
        couponError,
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
