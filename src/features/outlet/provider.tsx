"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOutletStore } from "@/store/outlet";
import { isOutletId } from "@/types";

/**
 * Keeps the document in step with the active outlet.
 *
 * Two jobs, both of which have to happen outside React's render: honouring a
 * shared `?outlet=coffee` link, and setting `data-outlet` on <html>, which is
 * what re-points `--color-brand` at the coffee palette. Doing the colour that
 * way means every existing `bg-brand` and `text-brand` utility in the app
 * follows the outlet without a single component being told about it.
 */
export function OutletProvider() {
  const params = useSearchParams();
  const outletId = useOutletStore((s) => s.outletId);
  const isHydrated = useOutletStore((s) => s.isHydrated);

  const requested = params.get("outlet");
  useEffect(() => {
    if (!isHydrated || !requested || !isOutletId(requested)) return;
    useOutletStore.getState().adoptFromUrl(requested);
  }, [isHydrated, requested]);

  useEffect(() => {
    // Before rehydration the markup is the restaurant's, so leave it alone.
    if (!isHydrated) return;
    document.documentElement.dataset.outlet = outletId;
  }, [isHydrated, outletId]);

  return null;
}
