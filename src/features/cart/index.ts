"use client";

import { useMemo } from "react";
import { estimateReadyTime, priceCart } from "@/services/cart-pricing";
import type { CartLine, OrderType } from "@/types";
import { useCartStore } from "@/store/cart";
import { useStoreQuery } from "../use-store-query";

/**
 * Priced cart. Re-reads when the menu, coupons or settings change so a price
 * edited in the admin tab is reflected before the customer pays.
 */
export function usePricedCart(
  lines: CartLine[],
  couponCode?: string,
  orderType: OrderType = "TAKEAWAY",
) {
  const key =
    lines.map((l) => l.lineKey + "x" + l.quantity).join("|") +
    "|" +
    (couponCode ?? "") +
    "|" +
    orderType;
  return useStoreQuery(
    () => priceCart({ lines, couponCode, orderType }),
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

/**
 * How many units of one menu item are in the cart, across every option
 * combination, plus the lines themselves so a stepper can act on them.
 */
export function useCartLinesFor(menuItemId: string) {
  const lines = useCartStore((s) => s.lines);
  const isHydrated = useCartStore((s) => s.isHydrated);

  return useMemo(() => {
    // Report empty until rehydration so server and first client paint agree.
    const mine = isHydrated ? lines.filter((l) => l.menuItemId === menuItemId) : [];
    return {
      lines: mine,
      quantity: mine.reduce((sum, line) => sum + line.quantity, 0),
      /** The line a "−" should act on: the one added most recently. */
      lastLineKey: mine.length > 0 ? mine[mine.length - 1].lineKey : null,
    };
  }, [lines, isHydrated, menuItemId]);
}
