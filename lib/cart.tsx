"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
} from "react";
import { Id } from "@/convex/_generated/dataModel";

export type CartLine = {
  itemId: Id<"items">;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  // A preorder is for a single pickup day (the menu changes daily).
  pickupDate: string | null;
  lines: CartLine[];
};

type CartAction =
  | { type: "add"; date: string; line: Omit<CartLine, "quantity">; quantity: number }
  | { type: "setQuantity"; itemId: Id<"items">; quantity: number }
  | { type: "remove"; itemId: Id<"items"> }
  | { type: "clear" }
  | { type: "hydrate"; state: CartState };

const STORAGE_KEY = "summer-treats-cart";
const empty: CartState = { pickupDate: null, lines: [] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "add": {
      // Switching days replaces the cart (orders can't span days).
      const base =
        state.pickupDate && state.pickupDate !== action.date ? empty : state;
      const existing = base.lines.find((l) => l.itemId === action.line.itemId);
      const lines = existing
        ? base.lines.map((l) =>
            l.itemId === action.line.itemId
              ? { ...l, quantity: l.quantity + action.quantity }
              : l,
          )
        : [...base.lines, { ...action.line, quantity: action.quantity }];
      return { pickupDate: action.date, lines };
    }
    case "setQuantity": {
      const lines = state.lines
        .map((l) =>
          l.itemId === action.itemId
            ? { ...l, quantity: Math.max(0, action.quantity) }
            : l,
        )
        .filter((l) => l.quantity > 0);
      return { ...state, lines, pickupDate: lines.length ? state.pickupDate : null };
    }
    case "remove": {
      const lines = state.lines.filter((l) => l.itemId !== action.itemId);
      return { ...state, lines, pickupDate: lines.length ? state.pickupDate : null };
    }
    case "clear":
      return empty;
    default:
      return state;
  }
}

type CartContextValue = {
  state: CartState;
  add: (date: string, line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (itemId: Id<"items">, quantity: number) => void;
  remove: (itemId: Id<"items">) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, empty);

  // Load from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) });
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore (e.g. private mode)
    }
  }, [state]);

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.quantity, 0);
    const total = state.lines.reduce((s, l) => s + l.price * l.quantity, 0);
    return {
      state,
      add: (date, line, quantity = 1) =>
        dispatch({ type: "add", date, line, quantity }),
      setQuantity: (itemId, quantity) =>
        dispatch({ type: "setQuantity", itemId, quantity }),
      remove: (itemId) => dispatch({ type: "remove", itemId }),
      clear: () => dispatch({ type: "clear" }),
      count,
      total,
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
