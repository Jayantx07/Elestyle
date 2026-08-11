import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../lib/apiClient';

export interface WishlistItem {
  id: string; // Product ID
  title: string;
  price: number;
  imageSrc: string;
  color?: { name: string; hex: string };
  dateAdded?: string;
  stockStatus?: 'In Stock' | 'Out of Stock';
  compareAtPrice?: number;
}

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  fetchWishlist: () => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { user, accessToken } = useAuth();
  const [hasMerged, setHasMerged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const res = await apiClient('/api/v1/wishlist', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.success && res.data) {
        const mappedItems: WishlistItem[] = res.data.map((p: any) => ({
          id: p._id,
          title: p.name,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          imageSrc: p.images && p.images.length > 0 ? p.images[0].secure_url : '',
          stockStatus: p.availability,
        }));
        setItems(mappedItems);
      }
    } catch (e) {
      console.error('Failed to fetch wishlist', e);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (user && accessToken && !hasMerged) {
      // Local merge could go here, for now we just fetch
      fetchWishlist().then(() => setHasMerged(true));
    }
    if (!user) {
      setItems([]);
      setHasMerged(false);
    }
  }, [user, accessToken, hasMerged, fetchWishlist]);

  const itemCount = items.length;

  const addToWishlist = async (newItem: WishlistItem) => {
    // Optimistic UI update
    setItems((prev) => {
      if (prev.find((i) => i.id === newItem.id)) return prev;
      return [...prev, newItem];
    });

    if (accessToken) {
      try {
        await apiClient('/api/v1/wishlist', {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ productId: newItem.id })
        });
      } catch (error) {
        console.error('Failed to add to wishlist backend', error);
        // Rollback on failure
        fetchWishlist();
      }
    }
  };

  const removeFromWishlist = async (id: string) => {
    // Optimistic UI update
    setItems((prev) => prev.filter((i) => i.id !== id));

    if (accessToken) {
      try {
        await apiClient(`/api/v1/wishlist/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      } catch (error) {
        console.error('Failed to remove from wishlist backend', error);
        // Rollback on failure
        fetchWishlist();
      }
    }
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
        fetchWishlist,
        isLoading
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
