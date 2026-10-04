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
  getSalesByOutlet,
  getSalesSummary,
  type ReportScope,
} from "@/services/reports";
import type { DateRange } from "@/services/reports";
import type { OutletId } from "@/types";
import { useAdminOutlet } from "../outlet";
import { useStoreQuery } from "../use-store-query";

/**
 * Report hooks. Every scope carries an optional outlet: unset is the super
 * admin's combined view, and an assigned admin is narrowed by the service
 * whatever the scope says.
 */
function scopeKey(scope: ReportScope) {
  return (
    scope.from.toISOString() +
    "|" +
    scope.to.toISOString() +
    "|" +
    (scope.outletId ?? "all")
  );
}

/** Shared wiring: stabilise the scope object, key the query on its contents. */
function useScopedReport<T>(
  scope: ReportScope,
  loader: (scope: ReportScope) => Promise<T>,
) {
  const key = scopeKey(scope);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => scope, [key]);
  return useStoreQuery(() => loader(stable), ["orders"], [key]);
}

/**
 * Folds the admin panel's outlet scope into a plain date range.
 *
 * Every chart takes a range from the period picker and has no business knowing
 * about outlets, so this is where the two meet — one call per chart instead of
 * threading the scope through two pages of props.
 */
export function useReportScope(range: DateRange): ReportScope {
  const { outletId } = useAdminOutlet();
  const key = range.from.getTime() + "|" + range.to.getTime() + "|" + (outletId ?? "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => ({ ...range, outletId }), [key]);
}

export function useDashboardKpis(outletId?: OutletId) {
  return useStoreQuery(
    () => getDashboardKpis(outletId),
    ["orders", "users", "bookings", "enquiries"],
    [outletId],
  );
}

export function useSalesSummary(scope: ReportScope) {
  return useScopedReport(scope, getSalesSummary);
}

/** Per-outlet split for the combined report. */
export function useSalesByOutlet(scope: ReportScope) {
  return useScopedReport(scope, getSalesByOutlet);
}

export function useRevenueByDay(scope: ReportScope) {
  return useScopedReport(scope, getRevenueByDay);
}

export function useItemPerformance(scope: ReportScope) {
  return useScopedReport(scope, getItemPerformance);
}

export function useCategoryShare(scope: ReportScope) {
  return useScopedReport(scope, getCategoryShare);
}

export function useOrdersByHour(scope: ReportScope) {
  return useScopedReport(scope, getOrdersByHour);
}

export function usePaymentSplit(scope: ReportScope) {
  return useScopedReport(scope, getPaymentSplit);
}

export function useOrderTypeSplit(scope: ReportScope) {
  return useScopedReport(scope, getOrderTypeSplit);
}

export function usePrepTimeAccuracy(scope: ReportScope) {
  return useScopedReport(scope, getPrepTimeAccuracy);
}

/** What the team did, newest first. Re-reads whenever anyone writes. */
export function useRecentActivity(limit = 8) {
  return useStoreQuery(() => getRecentActivity(limit), ["activityLog"], [limit]);
}
