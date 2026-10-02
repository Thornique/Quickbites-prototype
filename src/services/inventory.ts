import { invalid, notFound } from "@/lib/errors";
import { readCollection, writeCollection } from "@/storage";
import type {
  InventoryItem,
  MenuItem,
  Order,
  StockMovement,
  StockMovementType,
  StockStatus,
} from "@/types";
import { notifyStockLevels } from "./order-notifications";
import { logActivity, newId, nowIso, ready, requirePermission } from "./common";

export function stockStatus(item: InventoryItem): StockStatus {
  if (item.qty <= 0) return "OUT";
  if (item.qty <= item.lowStockThreshold) return "LOW";
  return "OK";
}

export async function listInventory(): Promise<InventoryItem[]> {
  await ready();
  return readCollection<InventoryItem>("inventoryItems").sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export async function listLowStock(): Promise<InventoryItem[]> {
  await ready();
  return readCollection<InventoryItem>("inventoryItems")
    .filter((item) => stockStatus(item) !== "OK")
    .sort((a, b) => a.qty - b.qty);
}

export async function listMovements(
  inventoryItemId?: string,
): Promise<StockMovement[]> {
  await ready();
  return readCollection<StockMovement>("stockMovements")
    .filter((m) => !inventoryItemId || m.inventoryItemId === inventoryItemId)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}

/** Total value of everything on the shelf. */
export async function getInventoryValuation(): Promise<number> {
  await ready();
  return readCollection<InventoryItem>("inventoryItems").reduce(
    (sum, item) => sum + item.qty * item.costPerUnit,
    0,
  );
}

interface MovementDraft {
  inventoryItemId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  orderId?: string;
  byUserId?: string;
}

/**
 * Applies quantity changes and writes the ledger in one pass, then
 * reconciles menu availability. Returns the menu items whose availability
 * flipped, so callers can tell the admin what else changed.
 */
function applyMovements(drafts: MovementDraft[]): {
  nowUnavailable: MenuItem[];
  nowAvailable: MenuItem[];
} {
  const items = readCollection<InventoryItem>("inventoryItems");
  const byId = new Map(items.map((item) => [item.id, { ...item }]));
  const movements: StockMovement[] = [];
  const at = nowIso();

  for (const draft of drafts) {
    const item = byId.get(draft.inventoryItemId);
    if (!item) continue;
    item.qty = Math.round((item.qty + draft.quantity) * 1000) / 1000;
    // Stock can be driven to zero but never negative.
    if (item.qty < 0) item.qty = 0;
    item.updatedAt = at;

    movements.push({
      id: newId("mv"),
      inventoryItemId: draft.inventoryItemId,
      type: draft.type,
      quantity: draft.quantity,
      balanceAfter: item.qty,
      reason: draft.reason,
      orderId: draft.orderId,
      byUserId: draft.byUserId,
      at,
    });
  }

  const nextItems = [...byId.values()];
  writeCollection("inventoryItems", nextItems, "update");

  // Only the items this movement actually touched are worth alerting on.
  const touched = new Set(drafts.map((d) => d.inventoryItemId));
  notifyStockLevels(nextItems.filter((item) => touched.has(item.id)));

  if (movements.length > 0) {
    const existing = readCollection<StockMovement>("stockMovements");
    writeCollection(
      "stockMovements",
      [...movements, ...existing].slice(0, 1000),
      "create",
    );
  }

  return reconcileMenuAvailability(nextItems);
}

/**
 * A menu item goes unavailable when any ingredient it links to hits zero, and
 * comes back when they are all restocked — but only if it was stock that took
 * it down, never if an admin switched it off by hand.
 */
function reconcileMenuAvailability(inventory: InventoryItem[]): {
  nowUnavailable: MenuItem[];
  nowAvailable: MenuItem[];
} {
  const qtyById = new Map(inventory.map((item) => [item.id, item.qty]));
  const menu = readCollection<MenuItem>("menuItems");
  const nowUnavailable: MenuItem[] = [];
  const nowAvailable: MenuItem[] = [];

  const next = menu.map((item) => {
    if (item.stockItemLinks.length === 0) return item;

    const isOut = item.stockItemLinks.some(
      (link) => (qtyById.get(link.inventoryItemId) ?? 0) <= 0,
    );

    if (isOut && item.isAvailable) {
      const updated: MenuItem = {
        ...item,
        isAvailable: false,
        unavailableReason: "OUT_OF_STOCK",
      };
      nowUnavailable.push(updated);
      return updated;
    }

    if (!isOut && !item.isAvailable && item.unavailableReason === "OUT_OF_STOCK") {
      const updated: MenuItem = {
        ...item,
        isAvailable: true,
        unavailableReason: undefined,
      };
      nowAvailable.push(updated);
      return updated;
    }

    return item;
  });

  if (nowUnavailable.length > 0 || nowAvailable.length > 0) {
    writeCollection("menuItems", next, "update");
  }
  return { nowUnavailable, nowAvailable };
}

/** What an order will consume, aggregated per inventory item. */
export function consumptionForOrder(order: Order): Map<string, number> {
  const menu = new Map(readCollection<MenuItem>("menuItems").map((i) => [i.id, i]));
  const totals = new Map<string, number>();

  for (const line of order.lines) {
    const item = menu.get(line.menuItemId);
    if (!item) continue;
    for (const link of item.stockItemLinks) {
      const current = totals.get(link.inventoryItemId) ?? 0;
      totals.set(link.inventoryItemId, current + link.quantityPerUnit * line.quantity);
    }
  }
  return totals;
}

/** Items this order would push below zero — the Accept dialog warns on these. */
export function projectShortfall(
  order: Order,
): Array<{ item: InventoryItem; needed: number }> {
  const inventory = new Map(
    readCollection<InventoryItem>("inventoryItems").map((i) => [i.id, i]),
  );
  const shortfall: Array<{ item: InventoryItem; needed: number }> = [];

  for (const [inventoryItemId, needed] of consumptionForOrder(order)) {
    const item = inventory.get(inventoryItemId);
    if (item && item.qty < needed) shortfall.push({ item, needed });
  }
  return shortfall;
}

/** Called when an order is ACCEPTED. */
export function deductForOrder(order: Order, byUserId: string) {
  const drafts: MovementDraft[] = [...consumptionForOrder(order)].map(
    ([inventoryItemId, quantity]) => ({
      inventoryItemId,
      type: "SALE",
      quantity: -quantity,
      orderId: order.id,
      byUserId,
    }),
  );
  return applyMovements(drafts);
}

/** Called when an accepted order is CANCELLED. */
export function restockForOrder(order: Order, byUserId: string) {
  const drafts: MovementDraft[] = [...consumptionForOrder(order)].map(
    ([inventoryItemId, quantity]) => ({
      inventoryItemId,
      type: "RESTOCK_ON_CANCEL",
      quantity,
      orderId: order.id,
      byUserId,
    }),
  );
  return applyMovements(drafts);
}

/** Purchase / goods-in. */
export async function stockIn(
  inventoryItemId: string,
  quantity: number,
  reason?: string,
) {
  await ready();
  const admin = requirePermission("INVENTORY");
  if (quantity <= 0) throw invalid("Enter a quantity greater than zero.", "quantity");

  const item = readCollection<InventoryItem>("inventoryItems").find(
    (i) => i.id === inventoryItemId,
  );
  if (!item) throw notFound("Inventory item");

  const result = applyMovements([
    { inventoryItemId, type: "PURCHASE", quantity, reason, byUserId: admin.id },
  ]);
  logActivity(
    admin,
    "STOCK_IN",
    `Added ${quantity} ${item.unit} of ${item.name}`,
    item.id,
  );
  return result;
}

/** Wastage or a stock-count correction. Signed quantity. */
export async function adjustStock(
  inventoryItemId: string,
  quantity: number,
  reason: string,
  type: Extract<StockMovementType, "WASTAGE" | "CORRECTION"> = "CORRECTION",
) {
  await ready();
  const admin = requirePermission("INVENTORY");
  if (quantity === 0) throw invalid("Enter a non-zero adjustment.", "quantity");
  if (!reason.trim())
    throw invalid("Please give a reason for the adjustment.", "reason");

  const item = readCollection<InventoryItem>("inventoryItems").find(
    (i) => i.id === inventoryItemId,
  );
  if (!item) throw notFound("Inventory item");

  const result = applyMovements([
    { inventoryItemId, type, quantity, reason, byUserId: admin.id },
  ]);
  logActivity(
    admin,
    "STOCK_ADJUSTED",
    `Adjusted ${item.name} by ${quantity} ${item.unit}`,
    item.id,
  );
  return result;
}

export async function createInventoryItem(
  input: Omit<InventoryItem, "id" | "createdAt">,
): Promise<InventoryItem> {
  await ready();
  const admin = requirePermission("INVENTORY");
  const rows = readCollection<InventoryItem>("inventoryItems");

  const item: InventoryItem = { ...input, id: newId("inv"), createdAt: nowIso() };
  writeCollection("inventoryItems", [...rows, item], "create", item.id);
  logActivity(admin, "INVENTORY_CREATED", `Added inventory item ${item.name}`, item.id);
  return item;
}

export async function updateInventoryItem(
  id: string,
  patch: Partial<Omit<InventoryItem, "id" | "createdAt">>,
): Promise<InventoryItem> {
  await ready();
  const admin = requirePermission("INVENTORY");
  const rows = readCollection<InventoryItem>("inventoryItems");
  const existing = rows.find((i) => i.id === id);
  if (!existing) throw notFound("Inventory item");

  const next: InventoryItem = { ...existing, ...patch, id, updatedAt: nowIso() };
  writeCollection(
    "inventoryItems",
    rows.map((i) => (i.id === id ? next : i)),
    "update",
    id,
  );
  logActivity(admin, "INVENTORY_UPDATED", `Updated inventory item ${next.name}`, id);
  return next;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await ready();
  const admin = requirePermission("INVENTORY");
  const rows = readCollection<InventoryItem>("inventoryItems");
  const existing = rows.find((i) => i.id === id);
  if (!existing) throw notFound("Inventory item");

  writeCollection(
    "inventoryItems",
    rows.filter((i) => i.id !== id),
    "delete",
    id,
  );
  logActivity(
    admin,
    "INVENTORY_DELETED",
    `Deleted inventory item ${existing.name}`,
    id,
  );
}
