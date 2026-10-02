"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartLineKey } from "@/lib/pricing";
import type { CartLine } from "@/types";

/**
 * Cart state.
 *
 * STEP 4 SCOPE: enough to hold lines and drive the header badge. Step 6 adds
 * pricing through CartPricingService, coupon handling, guest-cart merging on
 * login and the undo-remove toast. The persisted shape is deliberately just
 * the lines, so that work can extend it without a migration.
 */

interface CartState {
  lines: CartLine[];
  /** Server render and first paint must agree; flips true after rehydration. */
  isHydrated: boolean;

  addLine: (line: CartLine) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  removeLine: (lineKey: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isHydrated: false,

      addLine: (line) =>
        set((state) => {
          // Same item with the same options and note merges; anything else
          // becomes its own line.
          const key =
            line.lineKey ||
            cartLineKey(
              line.menuItemId,
              line.selectedOptions.map((o) => o.optionId),
              line.notes,
            );
          const existing = state.lines.find((l) => l.lineKey === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.lineKey === key ? { ...l, quantity: l.quantity + line.quantity } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, lineKey: key }] };
        }),

      setQuantity: (lineKey, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.lineKey !== lineKey)
              : state.lines.map((l) =>
                  l.lineKey === lineKey ? { ...l, quantity } : l,
                ),
        })),

      removeLine: (lineKey) =>
        set((state) => ({ lines: state.lines.filter((l) => l.lineKey !== lineKey) })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "qb:cart:guest",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    },
  ),
);

/** Total units in the cart — what the header badge shows. */
export function useCartCount(): number {
  const lines = useCartStore((s) => s.lines);
  const isHydrated = useCartStore((s) => s.isHydrated);
  // Report 0 until rehydrated so the server and client markup agree.
  if (!isHydrated) return 0;
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
