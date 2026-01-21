'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number; // in euro's
  qty: number;
};

type CartContextType = {
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

  // Laden uit localStorage (één keer bij mount)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Wegschrijven naar localStorage wanneer items veranderen
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = useCallback<CartContextType['addItem']>((item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === item.id);
      if (i >= 0) {
        const updatedQty = prev[i].qty + qty;
        if (updatedQty <= 0) {
          return prev.filter((p) => p.id !== item.id);
        }
        const clone = [...prev];
        clone[i] = { ...clone[i], qty: updatedQty };
        return clone;
      }
      return qty > 0 ? [...prev, { ...item, qty }] : prev;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => {
    // ⬇️ lokale opslag expliciet leegmaken
    try {
      if (typeof window !== 'undefined') {
        // verwijder alle sleutels die met "cart" beginnen
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cart')) {
            toRemove.push(key);
          }
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch {
      // ignore
    }
    // state in context leeg
    setItems([]);
  }, []);

  const { count, total } = useMemo(() => {
    const count = items.reduce((s, it) => s + it.qty, 0);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    return { count, total };
  }, [items]);

  const value: CartContextType = {
    items,
    count,
    total,
    addItem,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
