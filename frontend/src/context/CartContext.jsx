import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cart } from '../api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await cart.get();
      setCount(data.count || 0);
    } catch {
      setCount(0);
    }
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const data = await cart.add({ product_id: productId, quantity });
    setCount(data.cart_count);
    return data;
  }, []);

  return (
    <CartContext.Provider value={{ count, setCount, refresh, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
