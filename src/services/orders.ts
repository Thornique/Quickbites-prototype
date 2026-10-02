import { conflict, forbidden, invalid, notFound } from "@/lib/errors";
import { estimateReadyAtForLines } from "@/lib/prep-time";
import { readCollection, readSingleton, writeCollection } from "@/storage";
import type {
  CartLine,
  MenuItem,
  Order,
  OrderFilters,
  OrderLine,
  OrderStatus,
  OrderStatusEvent,
  PaymentMethod,
  PaymentStatus,
  StoreSettings,
  User,
} from "@/types";
import { ACTIVE_ORDER_STATUSES } from "@/types";
import { countActiveOrders, priceCart, validateCartAvailability } from "./cart-pricing";
import {
  getCurrentUser,
  logActivity,
  nowIso,
  ready,
  requirePermission,
  requireUser,
} from "./common";
import { recordCouponUse } from "./coupons";
import { deductForOrder, projectShortfall, restockForOrder } from "./inventory";

/** Which transitions the kitchen board is allowed to make. */
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: [],
  CANCELLED: [],
};

function settings(): StoreSettings {
  const stored = readSingleton<StoreSettings>("storeSettings");
  if (!stored) throw notFound("Store settings");
  return stored;
}

function nextOrderNumber(): string {
  const counters = readCollection<{ id: string; value: number }>("counters");
  const current = counters.find((c) => c.id === "orderNumber")?.value ?? 1000;
  const value = current + 1;
  writeCollection(
    "counters",
    counters.some((c) => c.id === "orderNumber")
      ? counters.map((c) => (c.id === "orderNumber" ? { ...c, value } : c))
      : [...counters, { id: "orderNumber", value }],
    "update",
  );
  return `QB-${value}`;
}

export function isActiveStatus(status: OrderStatus): boolean {
  return (ACTIVE_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}

export function filterOrders(orders: Order[], filters: OrderFilters = {}): Order[] {
  let rows = [...orders];

  if (filters.customerId)
    rows = rows.filter((o) => o.customerId === filters.customerId);
  if (filters.paymentMethod)
    rows = rows.filter((o) => o.paymentMethod === filters.paymentMethod);

  if (filters.status && filters.status !== "ALL") {
    rows =
      filters.status === "ACTIVE"
        ? rows.filter((o) => isActiveStatus(o.status))
        : rows.filter((o) => o.status === filters.status);
  }
  if (filters.from) {
    const from = Date.parse(filters.from);
    rows = rows.filter((o) => Date.parse(o.createdAt) >= from);
  }
  if (filters.to) {
    const to = Date.parse(filters.to);
    rows = rows.filter((o) => Date.parse(o.createdAt) <= to);
  }

  const term = filters.search?.trim().toLowerCase();
  if (term) {
    rows = rows.filter((o) =>
      [o.id, o.pickupName, o.phone].join(" ").toLowerCase().includes(term),
    );
  }

  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function listOrders(filters: OrderFilters = {}): Promise<Order[]> {
  await ready();
  return filterOrders(readCollection<Order>("orders"), filters);
}

/** The signed-in customer's own orders. */
export async function listMyOrders(): Promise<Order[]> {
  await ready();
  const user = requireUser();
  return filterOrders(readCollection<Order>("orders"), { customerId: user.id });
}

export async function getOrder(id: string): Promise<Order> {
  await ready();
  const order = readCollection<Order>("orders").find((o) => o.id === id);
  if (!order) throw notFound(`Order ${id}`);
  return order;
}

export interface PlaceOrderInput {
  lines: CartLine[];
  pickupName: string;
  phone: string;
  notes?: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  /** Set when the customer picked a later slot rather than "as soon as possible". */
  scheduledFor?: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  await ready();
  const user = requireUser();
  const config = settings();

  if (input.lines.length === 0) throw invalid("Your cart is empty.");
  if (!config.acceptingOrders) {
    throw conflict("We've paused new orders for now. Please try again shortly.");
  }

  // Re-check availability: an item can sell out between cart and payment.
  const availability = await validateCartAvailability(input.lines);
  if (!availability.ok) {
    const names = availability.unavailable.map((u) => u.name).join(", ");
    throw conflict(`${names} just sold out. Please remove it and try again.`);
  }

  const priced = await priceCart({ lines: input.lines, couponCode: input.couponCode });

  const readyAt = estimateReadyAtForLines(input.lines, countActiveOrders(), config);

  const placedAt = nowIso();
  const order: Order = {
    id: nextOrderNumber(),
    customerId: user.id,
    lines: priced.lines as OrderLine[],
    itemCount: priced.itemCount,
    subtotal: priced.subtotal,
    discount: priced.discount,
    couponCode: priced.appliedCouponCode,
    packagingCharge: priced.packagingCharge,
    taxRate: priced.taxRate,
    tax: priced.tax,
    total: priced.total,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === "COUNTER" ? "PAY_AT_COUNTER" : "PAID",
    status: "PLACED",
    statusHistory: [{ status: "PLACED", at: placedAt }],
    estimatedReadyAt: (input.scheduledFor
      ? new Date(input.scheduledFor)
      : readyAt
    ).toISOString(),
    scheduledFor: input.scheduledFor,
    pickupName: input.pickupName.trim(),
    phone: input.phone.trim(),
    notes: input.notes?.trim() || undefined,
    stockDeducted: false,
    createdAt: placedAt,
  };

  const orders = readCollection<Order>("orders");
  writeCollection("orders", [...orders, order], "create", order.id);

  if (priced.appliedCouponCode) recordCouponUse(priced.appliedCouponCode);

  return order;
}

function writeStatus(
  order: Order,
  status: OrderStatus,
  by: Pick<User, "id" | "name"> | null,
  reason?: string,
  extra: Partial<Order> = {},
): Order {
  const event: OrderStatusEvent = {
    status,
    at: nowIso(),
    byUserId: by?.id,
    byName: by?.name,
    reason,
  };
  const next: Order = {
    ...order,
    ...extra,
    status,
    statusHistory: [...order.statusHistory, event],
    updatedAt: event.at,
  };

  const orders = readCollection<Order>("orders");
  writeCollection(
    "orders",
    orders.map((o) => (o.id === order.id ? next : o)),
    "update",
    order.id,
  );
  return next;
}

export interface AcceptOptions {
  /** Minutes the admin added in the Accept dialog (+5 / +10). */
  extraMinutes?: number;
  /** Proceed even though stock would go negative; requires a reason. */
  overrideShortfall?: boolean;
  overrideReason?: string;
}

/**
 * Accepting is the point stock is committed. Refuses when an ingredient would
 * go negative unless the admin explicitly overrides with a reason.
 */
export async function acceptOrder(
  id: string,
  options: AcceptOptions = {},
): Promise<Order> {
  await ready();
  const admin = requirePermission("ORDERS");
  const order = await getOrder(id);

  if (order.status !== "PLACED") {
    throw conflict(`Order ${id} has already been ${order.status.toLowerCase()}.`);
  }

  const shortfall = projectShortfall(order);
  if (shortfall.length > 0 && !options.overrideShortfall) {
    const names = shortfall.map((s) => s.item.name).join(", ");
    throw conflict(`Not enough stock for: ${names}. Accept anyway to override.`);
  }
  if (shortfall.length > 0 && !options.overrideReason?.trim()) {
    throw invalid("Give a reason for overriding the stock warning.", "overrideReason");
  }

  const extra = Math.max(0, options.extraMinutes ?? 0);
  const estimatedReadyAt = new Date(
    Date.parse(order.estimatedReadyAt) + extra * 60_000,
  ).toISOString();

  const accepted = writeStatus(order, "ACCEPTED", admin, options.overrideReason, {
    estimatedReadyAt,
    stockDeducted: true,
  });

  deductForOrder(accepted, admin.id);
  logActivity(admin, "ORDER_ACCEPTED", `Accepted order ${id}`, id);
  return accepted;
}

/** Generic forward transition used by the board's one-click buttons. */
export async function advanceOrder(id: string, status: OrderStatus): Promise<Order> {
  await ready();
  const admin = requirePermission("ORDERS");
  const order = await getOrder(id);

  if (status === "ACCEPTED") return acceptOrder(id);
  if (status === "CANCELLED") {
    throw invalid("Use cancelOrder so a reason is recorded.");
  }
  if (!NEXT_STATUS[order.status].includes(status)) {
    throw conflict(`Order ${id} cannot go from ${order.status} to ${status}.`);
  }

  const next = writeStatus(order, status, admin);
  logActivity(
    admin,
    `ORDER_${status}`,
    `Marked order ${id} as ${status.toLowerCase()}`,
    id,
  );
  return next;
}

/**
 * Cancellation. Admins may cancel any open order; a customer may only cancel
 * their own, and only before the kitchen has accepted it.
 */
export async function cancelOrder(id: string, reason: string): Promise<Order> {
  await ready();
  const user = requireUser();
  const order = await getOrder(id);

  if (!reason.trim())
    throw invalid("Please give a reason for the cancellation.", "reason");
  if (order.status === "CANCELLED") throw conflict("That order is already cancelled.");
  if (order.status === "PICKED_UP")
    throw conflict("That order has already been picked up.");

  const isOwner = order.customerId === user.id;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (!isAdmin) {
    if (!isOwner) throw forbidden("You can only cancel your own orders.");
    if (order.status !== "PLACED") {
      throw conflict(
        "The kitchen has already started this order. Please call the store.",
      );
    }
  }

  const cancelled = writeStatus(order, "CANCELLED", isAdmin ? user : null, reason, {
    paymentStatus:
      order.paymentStatus === "PAID"
        ? ("REFUNDED" as PaymentStatus)
        : order.paymentStatus,
    stockDeducted: false,
  });

  // Only return stock that was actually taken.
  if (order.stockDeducted) restockForOrder(order, user.id);
  if (isAdmin)
    logActivity(user, "ORDER_CANCELLED", `Cancelled order ${id}: ${reason}`, id);

  return cancelled;
}

/** Adds the lines of a past order back into a cart. Skips sold-out items. */
export async function buildReorderLines(orderId: string): Promise<{
  lines: CartLine[];
  skipped: string[];
}> {
  await ready();
  const order = await getOrder(orderId);
  const menu = new Map(readCollection<MenuItem>("menuItems").map((i) => [i.id, i]));

  const lines: CartLine[] = [];
  const skipped: string[] = [];

  for (const line of order.lines) {
    const item = menu.get(line.menuItemId);
    if (!item || !item.isAvailable) {
      skipped.push(line.name.en);
      continue;
    }
    // Re-read the current price rather than the historical one.
    lines.push({ ...line, unitPrice: item.price, prepMinutes: item.prepMinutes });
  }

  return { lines, skipped };
}

/** Counts for the admin dashboard's live board. */
export async function getBoardCounts(): Promise<Record<OrderStatus, number>> {
  await ready();
  const counts = {
    PLACED: 0,
    ACCEPTED: 0,
    PREPARING: 0,
    READY: 0,
    PICKED_UP: 0,
    CANCELLED: 0,
  } satisfies Record<OrderStatus, number>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const order of readCollection<Order>("orders")) {
    if (
      Date.parse(order.createdAt) >= today.getTime() ||
      isActiveStatus(order.status)
    ) {
      counts[order.status] += 1;
    }
  }
  return counts;
}

/** Used by the customer tracking page to decide whether cancelling is allowed. */
export function canCustomerCancel(order: Order): boolean {
  const user = getCurrentUser();
  return !!user && order.customerId === user.id && order.status === "PLACED";
}
