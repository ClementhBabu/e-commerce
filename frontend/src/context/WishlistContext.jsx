import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { wishlist } from '../api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState(new Set());
  const [count, setCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const refresh = useCallback(async () => {
    try {
      const data = await wishlist.get();
      setProductIds(new Set(data.items.map((item) => item.product_id)));
      setCount(data.count || 0);
    } catch {
      setProductIds(new Set());
      setCount(0);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) await refresh();
      else { setProductIds(new Set()); setCount(0); }
    })();
  }, [isAuthenticated, refresh]);

  const toggleWishlist = useCallback(async (productId) => {
    if (productIds.has(productId)) {
      const data = await wishlist.remove(productId);
      setProductIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      setCount(data.wishlist_count);
      return false;
    }
    const data = await wishlist.add(productId);
    setProductIds((prev) => new Set(prev).add(productId));
    setCount(data.wishlist_count);
    return true;
  }, [productIds]);

  return (
    <WishlistContext.Provider value={{ productIds, count, refresh, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
