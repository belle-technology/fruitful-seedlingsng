import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartApi = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartApi | null>(null);
const STORAGE_KEY = "fs-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full/unavailable — cart stays in memory
    }
  }, [items, ready]);

  const api = useMemo<CartApi>(() => {
    const add: CartApi["add"] = (item, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((p) => p.productId === item.productId);
        if (existing) {
          return prev.map((p) =>
            p.productId === item.productId
              ? { ...p, qty: Math.min(p.qty + qty, 999) }
              : p,
          );
        }
        return [...prev, { ...item, qty }];
      });
    };
    const setQty: CartApi["setQty"] = (productId, qty) => {
      setItems((prev) =>
        qty <= 0
          ? prev.filter((p) => p.productId !== productId)
          : prev.map((p) =>
              p.productId === productId ? { ...p, qty: Math.min(qty, 999) } : p,
            ),
      );
    };
    const remove: CartApi["remove"] = (productId) =>
      setItems((prev) => prev.filter((p) => p.productId !== productId));
    const clear = () => setItems([]);
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((n, i) => n + i.qty * i.price, 0);
    return { items, count, total, add, setQty, remove, clear };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
