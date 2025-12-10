'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

  // Bepaal een key per gebruiker (of guest)
  const storageKey = useMemo(() => {
    const userAny = session?.user as any | undefined;
    const userId = userAny?.id || session?.user?.email;

    if (userId) {
      return `cart_user_${userId}`;
    }
    return 'cart_guest';
  }, [session]);

  const [items, setItems] = useState<CartItem[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  // 🔸 Laden / wisselen van winkelmandje bij verandering van gebruiker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Als we al voor deze key geladen hebben: niks doen
    if (loadedKey === storageKey) return;

    let nextItems: CartItem[] = [];

    try {
      // Case 1: we gaan van user -> guest (uitloggen)
      if (
        loadedKey &&
        loadedKey.startsWith('cart_user_') &&
        storageKey === 'cart_guest'
      ) {
        // Zorg dat de volgende gebruiker niet het oude mandje ziet
        localStorage.removeItem('cart_guest');
        nextItems = [];
      } else {
        // Case 2: gewoon mandje van de nieuwe key laden
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          nextItems = JSON.parse(raw);
        } else if (storageKey.startsWith('cart_user_')) {
          // Case 3: inloggen → als er nog geen user-cart is,
          // maar wél een guest-cart, neem die over.
          const rawGuest = localStorage.getItem('cart_guest');
          if (rawGuest) {
            nextItems = JSON.parse(rawGuest);
            localStorage.setItem(storageKey, rawGuest);
          }
        }
      }
    } catch {
      // bij parse-fouten gewoon een leeg mandje
      nextItems = [];
    }

    setItems(nextItems);
    setLoadedKey(storageKey);
  }, [storageKey, loadedKey]);

  // 🔸 Bewaar winkelmandje zodra items veranderen
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!loadedKey) return;

    try {
      localStorage.setItem(loadedKey, JSON.stringify(items));
    } catch {
      // negeren
    }
  }, [items, loadedKey]);

  const addItem: CartContextType['addItem'] = (item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === item.id);
      if (i >= 0) {
        const updatedQty = prev[i].qty + qty;
        if (updatedQty <= 0) {
          // verwijder als hoeveelheid 0 of minder wordt
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

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
