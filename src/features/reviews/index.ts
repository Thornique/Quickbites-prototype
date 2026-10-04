"use client";

import { getRatingSummary, listRateableOrders, listReviews } from "@/services/reviews";
import type { OutletId } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useReviews(outletId?: OutletId, approvedOnly = true) {
  return useStoreQuery(
    () => listReviews(outletId, approvedOnly),
    ["reviews"],
    [outletId, approvedOnly],
  );
}

export function useRatingSummary(outletId?: OutletId) {
  return useStoreQuery(() => getRatingSummary(outletId), ["reviews"], [outletId]);
}

/** Picked-up orders the customer has not rated yet. */
export function useRateableOrders() {
  return useStoreQuery(listRateableOrders, ["orders", "reviews"]);
}
