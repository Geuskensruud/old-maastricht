'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;   // in euro's
  qty: number;
};

export type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // laad / bewaar in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem: CartContextType['addItem'] = (item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === item.id);
      if (i >= 0) {
        const updatedQty = prev[i].qty + qty;
        if (updatedQty <= 0) {
          // verwijder als het 0 of minder wordt
          return prev.filter((p) => p.id !== item.id);
        }
        const clone = [...prev];
        clone[i] = { ...clone[i], qty: updatedQty };
        return clone;
      }
      // alleen toevoegen als qty positief is
      return qty > 0 ? [...prev, { ...item, qty }] : prev;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clear = () => setItems([]);

  const { count, total } = useMemo(() => {
    const count = items.reduce((s, it) => s + it.qty, 0);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    return { count, total };
  }, [items]);

  const value: CartContextType = { items, count, total, addItem, removeItem, clear };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
