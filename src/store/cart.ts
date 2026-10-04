"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cartLineKey } from "@/lib/pricing";
import { cartKey, readKey, removeKey, writeKey } from "@/storage";
import type { CartLine, OrderType, OutletId } from "@/types";
import { OUTLET_IDS } from "@/types";
import { activeOutletId } from "./outlet";

/**
 * Cart state.
 *
 * One basket per outlet, kept side by side: a customer who has three coffees
 * queued up and then goes to look at the burger menu must come back to find
 * the coffees still there. Switching outlet changes which basket is on screen
 * and nothing else — nothing is merged, nothing is cleared.
 *
 * Each signed-in customer also gets their own stored carts, so signing out
 * does not hand the next person at the counter the previous customer's
 * basket — and signing in merges whatever was built as a guest into the
 * account's carts rather than discarding it.
 */

const GUEST = "guest";

export interface OutletCart {
  lines: CartLine[];
  couponCode?: string;
}

type CartsByOutlet = Record<OutletId, OutletCart>;

interface CartState {
  carts: CartsByOutlet;
  /**
   * Takeaway or dine-in. Shared across outlets on purpose — it is how the
   * customer is eating today, not a property of one counter.
   */
  orderType: OrderType;
  /** Whose carts are currently loaded: a user id, or "guest". */
  ownerId: string;
  /** Server render and first paint must agree; flips true after rehydration. */
  isHydrated: boolean;

  addLine: (line: CartLine) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  removeLine: (lineKey: string) => CartLine | null;
  restoreLine: (line: CartLine, index: number) => void;
  setOrderType: (orderType: OrderType) => void;
  setCoupon: (code: string | undefined) => void;
  /** Empties the active outlet's cart only. */
  clear: () => void;
  /** Called when the session changes; merges or swaps carts as needed. */
  syncOwner: (userId: string | null) => void;
}

function emptyCarts(): CartsByOutlet {
  return OUTLET_IDS.reduce((carts, outletId) => {
    carts[outletId] = { lines: [], couponCode: undefined };
    return carts;
  }, {} as CartsByOutlet);
}

/** Fills in any outlet missing from stored (or older) data. */
function normaliseCarts(stored?: Partial<CartsByOutlet>): CartsByOutlet {
  const carts = emptyCarts();
  if (!stored) return carts;
  for (const outletId of OUTLET_IDS) {
    const cart = stored[outletId];
    if (cart)
      carts[outletId] = { lines: cart.lines ?? [], couponCode: cart.couponCode };
  }
  return carts;
}

function mergeLines(base: CartLine[], incoming: CartLine[]): CartLine[] {
  const merged = base.map((line) => ({ ...line }));
  for (const line of incoming) {
    const existing = merged.find((l) => l.lineKey === line.lineKey);
    if (existing) existing.quantity += line.quantity;
    else merged.push({ ...line });
  }
  return merged;
}

function mergeCarts(base: CartsByOutlet, incoming: CartsByOutlet): CartsByOutlet {
  const merged = emptyCarts();
  for (const outletId of OUTLET_IDS) {
    merged[outletId] = {
      lines: mergeLines(base[outletId].lines, incoming[outletId].lines),
      couponCode: base[outletId].couponCode ?? incoming[outletId].couponCode,
    };
  }
  return merged;
}

function hasAnyLines(carts: CartsByOutlet): boolean {
  return OUTLET_IDS.some((outletId) => carts[outletId].lines.length > 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: emptyCarts(),
      orderType: "TAKEAWAY",
      ownerId: GUEST,
      isHydrated: false,

      addLine: (line) =>
        set((state) => {
          const outletId = activeOutletId();
          const cart = state.carts[outletId];
          // Same item with the same options and note merges; anything else
          // becomes its own line.
          const key =
            line.lineKey ||
            cartLineKey(
              line.menuItemId,
              line.selectedOptions.map((o) => o.optionId),
              line.notes,
            );
          const existing = cart.lines.find((l) => l.lineKey === key);
          const lines = existing
            ? cart.lines.map((l) =>
                l.lineKey === key ? { ...l, quantity: l.quantity + line.quantity } : l,
              )
            : [...cart.lines, { ...line, lineKey: key }];

          return { carts: { ...state.carts, [outletId]: { ...cart, lines } } };
        }),

      setQuantity: (lineKey, quantity) =>
        set((state) => {
          const outletId = activeOutletId();
          const cart = state.carts[outletId];
          const lines =
            quantity <= 0
              ? cart.lines.filter((l) => l.lineKey !== lineKey)
              : cart.lines.map((l) => (l.lineKey === lineKey ? { ...l, quantity } : l));
          return { carts: { ...state.carts, [outletId]: { ...cart, lines } } };
        }),

      removeLine: (lineKey) => {
        const outletId = activeOutletId();
        const removed =
          get().carts[outletId].lines.find((l) => l.lineKey === lineKey) ?? null;
        set((state) => {
          const cart = state.carts[outletId];
          return {
            carts: {
              ...state.carts,
              [outletId]: {
                ...cart,
                lines: cart.lines.filter((l) => l.lineKey !== lineKey),
              },
            },
          };
        });
        return removed;
      },

      /** Puts an undone removal back where it was, not at the end. */
      restoreLine: (line, index) =>
        set((state) => {
          const outletId = activeOutletId();
          const cart = state.carts[outletId];
          if (cart.lines.some((l) => l.lineKey === line.lineKey)) return state;
          const lines = [...cart.lines];
          lines.splice(Math.min(index, lines.length), 0, line);
          return { carts: { ...state.carts, [outletId]: { ...cart, lines } } };
        }),

      setOrderType: (orderType) => set({ orderType }),

      setCoupon: (couponCode) =>
        set((state) => {
          const outletId = activeOutletId();
          return {
            carts: {
              ...state.carts,
              [outletId]: { ...state.carts[outletId], couponCode },
            },
          };
        }),

      clear: () =>
        set((state) => ({
          carts: {
            ...state.carts,
            [activeOutletId()]: { lines: [], couponCode: undefined },
          },
        })),

      syncOwner: (userId) => {
        const state = get();
        const nextOwner = userId ?? GUEST;
        if (!state.isHydrated || state.ownerId === nextOwner) return;

        // Park the carts that are on screen under whoever owned them.
        writeKey(
          cartKey(state.ownerId),
          state.ownerId === GUEST ? emptyCarts() : state.carts,
        );

        const stored = normaliseCarts(
          readKey<Partial<CartsByOutlet> | undefined>(cartKey(nextOwner), undefined),
        );

        if (state.ownerId === GUEST && hasAnyLines(state.carts)) {
          // Signing in: fold the guest baskets into the account's, per outlet.
          set({ ownerId: nextOwner, carts: mergeCarts(stored, state.carts) });
          removeKey(cartKey(GUEST));
          return;
        }

        set({ ownerId: nextOwner, carts: stored });
      },
    }),
    {
      name: "qb:cart:active",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        carts: state.carts,
        orderType: state.orderType,
        ownerId: state.ownerId,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<CartState>;
        return {
          ...current,
          ...saved,
          carts: normaliseCarts(saved.carts),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    },
  ),
);

/** The active outlet's basket. */
export function useCart(outletId: OutletId): OutletCart {
  return useCartStore((s) => s.carts[outletId]);
}

/** Total units in the active outlet's cart — what the header badge shows. */
export function useCartCount(outletId: OutletId): number {
  const cart = useCartStore((s) => s.carts[outletId]);
  const isHydrated = useCartStore((s) => s.isHydrated);
  // Report 0 until rehydrated so the server and client markup agree.
  if (!isHydrated) return 0;
  return cart.lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Units waiting in the OTHER outlet's cart, for the "still in your…" nudge. */
export function useOtherCartCount(outletId: OutletId): number {
  const carts = useCartStore((s) => s.carts);
  const isHydrated = useCartStore((s) => s.isHydrated);
  if (!isHydrated) return 0;
  return OUTLET_IDS.filter((id) => id !== outletId).reduce(
    (sum, id) => sum + carts[id].lines.reduce((n, line) => n + line.quantity, 0),
    0,
  );
}
