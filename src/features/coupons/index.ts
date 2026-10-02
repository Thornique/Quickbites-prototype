"use client";

import { listCoupons, listOffersForCart } from "@/services/coupons";
import type { PricedCartLine } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useCoupons(activeOnly = false) {
  return useStoreQuery(() => listCoupons(activeOnly), ["coupons"], [activeOnly]);
}

/** Offers with eligibility for the current cart, so the UI can explain why not. */
export function useOffersForCart(lines: PricedCartLine[]) {
  const key = lines.map((l) => l.lineKey + "x" + l.quantity).join("|");
  return useStoreQuery(() => listOffersForCart(lines), ["coupons", "orders"], [key]);
}
