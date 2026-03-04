import { createContext, useContext, useState, type ReactNode } from "react";
import type { Mirror, MirrorOptions } from "../types/mirror";

export interface BasketItem extends Mirror {
  lineId: string;
  quantity: number;
  options: MirrorOptions;
}

function matchOptions(a: MirrorOptions, b: MirrorOptions): boolean {
  return (
    a.finish === b.finish && a.height === b.height && a.width === b.width
  );
}

interface BasketContextValue {
  items: BasketItem[];
  addItem: (mirror: Mirror, options: MirrorOptions, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  itemCount: number;
}

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);

  const addItem = (mirror: Mirror, options: MirrorOptions, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === mirror.id && matchOptions(i.options, options)
      );
      if (existing) {
        return prev.map((i) =>
          i.lineId === existing.lineId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      const lineId = crypto.randomUUID();
      return [...prev, { ...mirror, lineId, quantity, options }];
    });
  };

  const removeItem = (lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <BasketContext.Provider value={{ items, addItem, removeItem, itemCount }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used within BasketProvider");
  return ctx;
}
