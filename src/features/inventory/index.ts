"use client";

import {
  getInventoryValuation,
  listInventory,
  listLowStock,
  listMovements,
} from "@/services/inventory";
import { useStoreQuery } from "../use-store-query";

export function useInventory() {
  return useStoreQuery(listInventory, ["inventoryItems"]);
}

export function useLowStock() {
  return useStoreQuery(listLowStock, ["inventoryItems"]);
}

export function useStockMovements(inventoryItemId?: string) {
  return useStoreQuery(
    () => listMovements(inventoryItemId),
    ["stockMovements"],
    [inventoryItemId],
  );
}

export function useInventoryValuation() {
  return useStoreQuery(getInventoryValuation, ["inventoryItems"]);
}
