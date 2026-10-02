"use client";

import { useMemo } from "react";
import {
  getCategoryShare,
  getDashboardKpis,
  getItemPerformance,
  getOrderTypeSplit,
  getOrdersByHour,
  getPaymentSplit,
  getPrepTimeAccuracy,
  getRecentActivity,
  getRevenueByDay,
  getSalesSummary,
  type DateRange,
} from "@/services/reports";
import { useStoreQuery } from "../use-store-query";

function rangeKey(range: DateRange) {
  return range.from.toISOString() + "|" + range.to.toISOString();
}

export function useDashboardKpis() {
  return useStoreQuery(() => getDashboardKpis(), ["orders", "users"]);
}

export function useSalesSummary(range: DateRange) {
  const key = rangeKey(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => range, [key]);
  return useStoreQuery(() => getSalesSummary(stable), ["orders"], [key]);
}

export function useRevenueByDay(range: DateRange) {
  const key = rangeKey(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => range, [key]);
  return useStoreQuery(() => getRevenueByDay(stable), ["orders"], [key]);
}

export function useItemPerformance(range: DateRange) {
  const key = rangeKey(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => range, [key]);
  return useStoreQuery(() => getItemPerformance(stable), ["orders"], [key]);
}

export function useCategoryShare(range: DateRange) {
  const key = rangeKey(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => range, [key]);
  return useStoreQuery(() => getCategoryShare(stable), ["orders"], [key]);
}

export function useOrdersByHour(range: DateRange) {
  const key = rangeKey(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => range, [key]);
  return useStoreQuery(() => getOrdersByHour(stable), ["orders"], [key]);
}

export function usePaymentSplit(range: DateRange) {
  const key = rangeKey(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => range, [key]);
  return useStoreQuery(() => getPaymentSplit(stable), ["orders"], [key]);
}

export function useOrderTypeSplit(range: DateRange) {
  const key = rangeKey(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => range, [key]);
  return useStoreQuery(() => getOrderTypeSplit(stable), ["orders"], [key]);
}

export function usePrepTimeAccuracy(range: DateRange) {
  const key = rangeKey(range);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => range, [key]);
  return useStoreQuery(() => getPrepTimeAccuracy(stable), ["orders"], [key]);
}

/** What the team did, newest first. Re-reads whenever anyone writes. */
export function useRecentActivity(limit = 8) {
  return useStoreQuery(() => getRecentActivity(limit), ["activityLog"], [limit]);
}
