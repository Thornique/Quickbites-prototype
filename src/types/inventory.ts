import type { IsoDateTime, Timestamped } from "./common";

export const INVENTORY_UNITS = ["pcs", "kg", "g", "litre", "ml", "pack"] as const;
export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

export interface InventoryItem extends Timestamped {
  id: string;
  name: string;
  unit: InventoryUnit;
  qty: number;
  lowStockThreshold: number;
  costPerUnit: number;
  /** Grouping shown in the inventory table, e.g. "Bakery", "Dairy". */
  category: string;
}

/** Computed from qty vs threshold — never stored. */
export type StockStatus = "OK" | "LOW" | "OUT";

export const STOCK_MOVEMENT_TYPES = [
  "PURCHASE",
  "SALE",
  "WASTAGE",
  "CORRECTION",
  "RESTOCK_ON_CANCEL",
] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: StockMovementType;
  /** Signed: positive adds stock, negative consumes it. */
  quantity: number;
  /** Running quantity after this movement, so history reads without replay. */
  balanceAfter: number;
  reason?: string;
  /** Set for SALE and RESTOCK_ON_CANCEL movements. */
  orderId?: string;
  byUserId?: string;
  at: IsoDateTime;
}
