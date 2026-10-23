import { createContext, useContext, useState, type ReactNode } from "react";

type OpenApi = { open: boolean; setOpen: (v: boolean) => void };

const CartDrawerOpenContext = createContext<OpenApi | null>(null);

export function CartDrawerOpenProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <CartDrawerOpenContext.Provider value={{ open, setOpen }}>
      {children}
    </CartDrawerOpenContext.Provider>
  );
}

export function useCartDrawerOpen(): OpenApi {
  const ctx = useContext(CartDrawerOpenContext);
  if (!ctx) throw new Error("useCartDrawerOpen must be used inside CartDrawerOpenProvider");
  return ctx;
}
