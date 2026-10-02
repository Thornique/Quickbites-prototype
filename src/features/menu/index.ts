"use client";

import { useMemo } from "react";
import {
  getMenuItemBySlug,
  listBestsellers,
  listMenuItems,
  type MenuFilters,
} from "@/services/menu";
import { getCategoryCounts, listCategories } from "@/services/categories";
import { useStoreQuery } from "../use-store-query";

/** Menu list, re-reading whenever an admin edits an item in another tab. */
export function useMenu(filters: MenuFilters = {}) {
  const key = JSON.stringify(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => filters, [key]);
  return useStoreQuery(() => listMenuItems(stable), ["menuItems"], [key]);
}

export function useMenuItem(slug: string) {
  return useStoreQuery(() => getMenuItemBySlug(slug), ["menuItems"], [slug]);
}

export function useBestsellers(limit = 8) {
  return useStoreQuery(() => listBestsellers(limit), ["menuItems"], [limit]);
}

export function useCategories(activeOnly = false) {
  return useStoreQuery(() => listCategories(activeOnly), ["categories"], [activeOnly]);
}

export function useCategoryCounts() {
  return useStoreQuery(getCategoryCounts, ["menuItems", "categories"]);
}
