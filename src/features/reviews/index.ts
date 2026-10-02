"use client";

import { getRatingSummary, listRateableOrders, listReviews } from "@/services/reviews";
import { useStoreQuery } from "../use-store-query";

export function useReviews(approvedOnly = true) {
  return useStoreQuery(() => listReviews(approvedOnly), ["reviews"], [approvedOnly]);
}

export function useRatingSummary() {
  return useStoreQuery(getRatingSummary, ["reviews"]);
}

/** Picked-up orders the customer has not rated yet. */
export function useRateableOrders() {
  return useStoreQuery(listRateableOrders, ["orders", "reviews"]);
}
