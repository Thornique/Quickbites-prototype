"use client";

import { listCoupons, listOffersForCart } from "@/services/coupons";
import type { OutletId, PricedCartLine } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useCoupons(outletId: OutletId, activeOnly = false) {
  return useStoreQuery(
    () => listCoupons(outletId, activeOnly),
    ["coupons"],
    [outletId, activeOnly],
  );
}

/** Offers with eligibility for the current cart, so the UI can explain why not. */
export function useOffersForCart(outletId: OutletId, lines: PricedCartLine[]) {
  const key = lines.map((l) => l.lineKey + "x" + l.quantity).join("|");
  return useStoreQuery(
    () => listOffersForCart(outletId, lines),
    ["coupons", "orders"],
    [outletId, key],
  );
}
