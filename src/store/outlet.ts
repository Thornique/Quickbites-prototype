"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_OUTLET_ID } from "@/lib/outlets";
import { OUTLET_KEY } from "@/storage";
import type { OutletId } from "@/types";
import { isOutletId } from "@/types";

/**
 * Which outlet the customer is shopping at.
 *
 * One choice drives the whole storefront — menu, categories, offers, banners,
 * open/closed, scheduling, the accent colour and the wordmark — so it lives in
 * one store rather than being threaded through the page tree. It is persisted,
 * because a regular who only ever buys coffee should not have to re-pick the
 * coffee shop on every visit.
 */

interface OutletState {
  outletId: OutletId;
  /**
   * False until the visitor has actually picked. The home page shows the
   * two-card choice while it is false; everything else falls back to the
   * restaurant, which is the older and larger of the two.
   */
  hasChosen: boolean;
  /** Server render and first paint must agree; flips true after rehydration. */
  isHydrated: boolean;
  setOutlet: (outletId: OutletId) => void;
  /** Used by the `?outlet=` link handler, which should not count as a choice. */
  adoptFromUrl: (outletId: OutletId) => void;
}

export const useOutletStore = create<OutletState>()(
  persist(
    (set, get) => ({
      outletId: DEFAULT_OUTLET_ID,
      hasChosen: false,
      isHydrated: false,

      setOutlet: (outletId) => {
        if (!isOutletId(outletId)) return;
        set({ outletId, hasChosen: true });
      },

      /*
        A shared link decides the outlet but leaves `hasChosen` alone: the
        visitor was sent here, they did not choose, and the home page should
        still offer them the other counter.
      */
      adoptFromUrl: (outletId) => {
        if (!isOutletId(outletId) || get().outletId === outletId) return;
        set({ outletId });
      },
    }),
    {
      name: OUTLET_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        outletId: state.outletId,
        hasChosen: state.hasChosen,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    },
  ),
);

/**
 * The outlet to read data for.
 *
 * Reports the restaurant until rehydration so the server markup and the first
 * client paint agree; the real choice arrives one tick later and the store
 * queries re-run on it.
 */
export function activeOutletId(): OutletId {
  const state = useOutletStore.getState();
  return state.isHydrated ? state.outletId : DEFAULT_OUTLET_ID;
}
