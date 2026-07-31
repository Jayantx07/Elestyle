import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface WishlistItem {
  id: string; // Product ID
  title: string;
  price: number;
  imageSrc: string;
  color?: { name: string; hex: string };
  dateAdded?: string;
  stockStatus?: 'In Stock' | 'Out of Stock';
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const { user } = useAuth();
  const [hasMerged, setHasMerged] = useState(false);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (user && !hasMerged) {
      console.log('Merging local wishlist to DB for user:', user.email);
      // Here you would call a backend API to push local items to the DB
      // Then clear local storage and fetch DB wishlist.
      setHasMerged(true);
    }
    if (!user) {
      setHasMerged(false);
    }
  }, [user, items, hasMerged]);

  const itemCount = items.length;

  const addToWishlist = (newItem: WishlistItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === newItem.id)) return prev; // already exists
      return [...prev, newItem];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isInWishlist = (id: string) => {
    return items.some((i) => i.id === id);
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
