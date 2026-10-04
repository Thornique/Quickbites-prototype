"use client";

import { useMemo } from "react";
import {
  getMenuItemBySlug,
  listBestsellers,
  listMenuItems,
  type MenuFilters,
} from "@/services/menu";
import { getCategoryCounts, listCategories } from "@/services/categories";
import type { OutletId } from "@/types";
import { useStoreQuery } from "../use-store-query";

/**
 * Catalogue hooks.
 *
 * Every one takes the outlet explicitly rather than reading the active one
 * itself: the admin panel asks for the outlet in its switcher, the storefront
 * asks for the one the customer is browsing, and both re-read when it changes
 * because the id is part of the query key.
 */

/** Menu list, re-reading whenever an admin edits an item in another tab. */
export function useMenu(filters: MenuFilters = {}) {
  const key = JSON.stringify(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => filters, [key]);
  return useStoreQuery(() => listMenuItems(stable), ["menuItems"], [key]);
}

export function useMenuItem(outletId: OutletId, slug: string) {
  return useStoreQuery(
    () => getMenuItemBySlug(outletId, slug),
    ["menuItems"],
    [outletId, slug],
  );
}

export function useBestsellers(outletId: OutletId, limit = 8) {
  return useStoreQuery(
    () => listBestsellers(outletId, limit),
    ["menuItems"],
    [outletId, limit],
  );
}

export function useCategories(outletId: OutletId, activeOnly = false) {
  return useStoreQuery(
    () => listCategories(outletId, activeOnly),
    ["categories"],
    [outletId, activeOnly],
  );
}

export function useCategoryCounts(outletId: OutletId) {
  return useStoreQuery(
    () => getCategoryCounts(outletId),
    ["menuItems", "categories"],
    [outletId],
  );
}
