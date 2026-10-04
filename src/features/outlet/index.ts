"use client";

import { useCallback } from "react";
import { getOutlet, OUTLET_DETAILS } from "@/lib/outlets";
import { useOutletStore } from "@/store/outlet";
import type { Outlet, OutletId } from "@/types";

export interface OutletSnapshot {
  outletId: OutletId;
  outlet: Outlet;
  /** "7:30 AM – 10:30 PM, all days" and the maps link for this outlet. */
  details: (typeof OUTLET_DETAILS)[OutletId];
  /** False until the stored choice has been read. */
  isHydrated: boolean;
  /** False until the visitor has picked an outlet themselves. */
  hasChosen: boolean;
  setOutlet: (outletId: OutletId) => void;
}

/**
 * The active outlet, for components. Every storefront data hook takes its
 * `outletId` from here, so one switch re-reads the whole page.
 */
export function useOutlet(): OutletSnapshot {
  const outletId = useOutletStore((s) => s.outletId);
  const hasChosen = useOutletStore((s) => s.hasChosen);
  const isHydrated = useOutletStore((s) => s.isHydrated);
  const setOutlet = useOutletStore((s) => s.setOutlet);

  return {
    outletId,
    outlet: getOutlet(outletId),
    details: OUTLET_DETAILS[outletId],
    isHydrated,
    hasChosen,
    setOutlet: useCallback((next: OutletId) => setOutlet(next), [setOutlet]),
  };
}

/** Just the id, for the many hooks that need nothing else. */
export function useOutletId(): OutletId {
  return useOutletStore((s) => s.outletId);
}

export { OutletProvider } from "./provider";
export { OutletSwitch } from "./outlet-switch";
export { OutletBadge } from "./outlet-badge";
