"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cartLineKey } from "@/lib/pricing";
import { cartKey, readKey, removeKey, writeKey } from "@/storage";
import type { CartLine, OrderType } from "@/types";

/**
 * Cart state.
 *
 * The active cart is persisted under one key. Each signed-in customer also
 * gets their own stored cart, so signing out does not hand the next person at
 * the counter the previous customer's basket — and signing in merges whatever
 * was built as a guest into the account's cart rather than discarding it.
 */

const GUEST = "guest";

interface CartState {
  lines: CartLine[];
  orderType: OrderType;
  couponCode?: string;
  /** Whose cart is currently loaded: a user id, or "guest". */
  ownerId: string;
  /** Server render and first paint must agree; flips true after rehydration. */
  isHydrated: boolean;

  addLine: (line: CartLine) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  removeLine: (lineKey: string) => CartLine | null;
  restoreLine: (line: CartLine, index: number) => void;
  setOrderType: (orderType: OrderType) => void;
  setCoupon: (code: string | undefined) => void;
  clear: () => void;
  /** Called when the session changes; merges or swaps carts as needed. */
  syncOwner: (userId: string | null) => void;
}

interface StoredCart {
  lines: CartLine[];
  couponCode?: string;
}

function mergeLines(base: CartLine[], incoming: CartLine[]): CartLine[] {
  const merged = [...base];
  for (const line of incoming) {
    const existing = merged.find((l) => l.lineKey === line.lineKey);
    if (existing) existing.quantity += line.quantity;
    else merged.push({ ...line });
  }
  return merged;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      orderType: "TAKEAWAY",
      couponCode: undefined,
      ownerId: GUEST,
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

      removeLine: (lineKey) => {
        const removed = get().lines.find((l) => l.lineKey === lineKey) ?? null;
        set((state) => ({ lines: state.lines.filter((l) => l.lineKey !== lineKey) }));
        return removed;
      },

      /** Puts an undone removal back where it was, not at the end. */
      restoreLine: (line, index) =>
        set((state) => {
          if (state.lines.some((l) => l.lineKey === line.lineKey)) return state;
          const lines = [...state.lines];
          lines.splice(Math.min(index, lines.length), 0, line);
          return { lines };
        }),

      setOrderType: (orderType) => set({ orderType }),
      setCoupon: (couponCode) => set({ couponCode }),
      clear: () => set({ lines: [], couponCode: undefined }),

      syncOwner: (userId) => {
        const state = get();
        const nextOwner = userId ?? GUEST;
        if (!state.isHydrated || state.ownerId === nextOwner) return;

        // Park the cart that is on screen under whoever owned it.
        writeKey(cartKey(state.ownerId), {
          lines: state.ownerId === GUEST ? [] : state.lines,
          couponCode: state.ownerId === GUEST ? undefined : state.couponCode,
        } satisfies StoredCart);

        const stored = readKey<StoredCart>(cartKey(nextOwner), {
          lines: [],
          couponCode: undefined,
        });

        if (state.ownerId === GUEST && state.lines.length > 0) {
          // Signing in: fold the guest basket into the account's cart.
          set({
            ownerId: nextOwner,
            lines: mergeLines(stored.lines, state.lines),
            couponCode: stored.couponCode ?? state.couponCode,
          });
          removeKey(cartKey(GUEST));
          return;
        }

        set({
          ownerId: nextOwner,
          lines: stored.lines,
          couponCode: stored.couponCode,
        });
      },
    }),
    {
      name: "qb:cart:active",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lines: state.lines,
        orderType: state.orderType,
        couponCode: state.couponCode,
        ownerId: state.ownerId,
      }),
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
