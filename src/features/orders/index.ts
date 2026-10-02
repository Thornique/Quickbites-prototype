"use client";

import { useMemo } from "react";
import {
  getAdminNames,
  getBoardCounts,
  getOperationalCounts,
  getOrder,
  listMyOrders,
  listOrders,
} from "@/services/orders";
import type { OrderFilters } from "@/types";
import { useStoreQuery } from "../use-store-query";

/**
 * The admin order board. Re-reads on every order write, including ones made
 * by a customer in another tab — that is how a new order appears live.
 */
export function useOrders(filters: OrderFilters = {}) {
  const key = JSON.stringify(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => filters, [key]);
  return useStoreQuery(() => listOrders(stable), ["orders"], [key]);
}

/** A single order — powers the customer tracking page's live updates. */
export function useOrder(id: string) {
  return useStoreQuery(() => getOrder(id), ["orders"], [id]);
}

export function useMyOrders() {
  return useStoreQuery(listMyOrders, ["orders"]);
}

export function useBoardCounts() {
  return useStoreQuery(getBoardCounts, ["orders"]);
}

/** What orders still need doing — needs ORDERS, not REPORTS. */
export function useOperationalCounts() {
  return useStoreQuery(() => getOperationalCounts(), ["orders"]);
}

/** id → name for the admins who touched an order. */
export function useAdminNames() {
  return useStoreQuery(getAdminNames, ["users"]);
}
