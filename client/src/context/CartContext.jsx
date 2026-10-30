import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Ang cart ay nasa localStorage ("canteen_cart") gaya ng orihinal.
const CART_KEY = 'canteen_cart';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  // item galing sa menu: { item_id, item_name, price }
  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item_id === item.item_id);
      if (existing) {
        return prev.map((i) => (i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { item_id: item.item_id, name: item.item_name, price: item.price, quantity: 1 }];
    });
  }, []);

  const changeQty = useCallback((index, delta) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        let quantity = item.quantity + delta;
        if (quantity < 1) quantity = 1;
        return { ...item, quantity };
      })
    );
  }, []);

  const removeItem = useCallback((index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(
    () => ({
      cart,
      totalQty: cart.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      addToCart,
      changeQty,
      removeItem,
      clearCart
    }),
    [cart, addToCart, changeQty, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
