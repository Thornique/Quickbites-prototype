"use client";

import { estimateReadyTime, priceCart } from "@/services/cart-pricing";
import type { CartLine } from "@/types";
import { useStoreQuery } from "../use-store-query";

/**
 * Priced cart. Re-reads when the menu, coupons or settings change so a price
 * edited in the admin tab is reflected before the customer pays.
 */
export function usePricedCart(lines: CartLine[], couponCode?: string) {
  const key =
    lines.map((l) => l.lineKey + "x" + l.quantity).join("|") + "|" + (couponCode ?? "");
  return useStoreQuery(
    () => priceCart({ lines, couponCode }),
    ["menuItems", "coupons", "storeSettings"],
    [key],
  );
}

/** Live "ready by" estimate, which moves as the kitchen queue grows. */
export function useReadyEstimate(lines: CartLine[]) {
  const key = lines.map((l) => l.lineKey).join("|");
  return useStoreQuery(
    () => estimateReadyTime(lines),
    ["orders", "storeSettings"],
    [key],
  );
}
