"use client";

import {
  getInventoryValuation,
  listInventory,
  listLowStock,
  listMovements,
} from "@/services/inventory";
import type { OutletId } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useInventory(outletId?: OutletId) {
  return useStoreQuery(() => listInventory(outletId), ["inventoryItems"], [outletId]);
}

export function useLowStock(outletId?: OutletId) {
  return useStoreQuery(() => listLowStock(outletId), ["inventoryItems"], [outletId]);
}

export function useStockMovements(inventoryItemId?: string, outletId?: OutletId) {
  return useStoreQuery(
    () => listMovements(inventoryItemId, outletId),
    ["stockMovements"],
    [inventoryItemId, outletId],
  );
}

export function useInventoryValuation(outletId?: OutletId) {
  return useStoreQuery(
    () => getInventoryValuation(outletId),
    ["inventoryItems"],
    [outletId],
  );
}
