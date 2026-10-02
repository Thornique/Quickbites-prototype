import {
  conflict,
  forbidden,
  invalid,
  notFound,
  paymentNotVerified,
} from "@/lib/errors";
import { estimatePrepMinutes } from "@/lib/prep-time";
import { readCollection, readSingleton, writeCollection } from "@/storage";
import type {
  CartLine,
  MenuItem,
  Order,
  OrderFilters,
  OrderFlags,
  OrderStatus,
  OrderType,
  PaymentEvent,
  PaymentMethod,
  StoreSettings,
  User,
} from "@/types";
import { ACTIVE_ORDER_STATUSES, isOnlineMethod } from "@/types";
import {
  buildCartLine,
  countActiveOrders,
  priceCart,
  validateCartAvailability,
} from "./cart-pricing";
import {
  getCurrentUser,
  logActivity,
  ready,
  requirePermission,
  requireUser,
} from "./common";
import { recordCouponUse } from "./coupons";
import { deductForOrder, projectShortfall, restockForOrder } from "./inventory";
import {
  NEXT_STATUS,
  applyAutoCancellations,
  canHandOver,
  canStartKitchen,
  deriveFlags,
  generatePaymentRef,
  isMethodAllowed,
  isPaymentVerified,
  needsRefund,
  nextTokenNumber,
  scheduleCancelDeadline,
  toOrderLines,
} from "./order-rules";
import {
  notifyAutoCancelled,
  notifyOrderAccepted,
  notifyOrderCancelled,
  notifyOrderPlaced,
  notifyPaymentRejected,
  notifyReadyTimeExtended,
  notifyStatusChange,
  notifySwitchedToOnline,
  reconcileOrderAlerts,
} from "./order-notifications";
import {
  buildSchedulableDays,
  buildSlotsForDate,
  checkSlot,
  type ScheduleSlot,
} from "./order-schedule";

const MIN_READY_MINUTES = 1;
const MAX_READY_MINUTES = 90;

function settings(): StoreSettings {
  const stored = readSingleton<StoreSettings>("storeSettings");
  if (!stored) throw notFound("Store settings");
  return stored;
}

/**
 * Reads orders, first applying the auto-cancel rule for takeaway payments
 * that were rejected and never retried. There is no server to run a timer, so
 * the rule is evaluated on read and only written when it actually fires.
 */
function readOrders(): Order[] {
  const rows = readCollection<Order>("orders");
  const { orders, changed } = applyAutoCancellations(rows, settings());

  if (changed) {
    writeCollection("orders", orders, "update");
    // Tell the people affected about the ones that just timed out.
    const before = new Map(rows.map((o) => [o.id, o.status]));
    for (const order of orders) {
      if (before.get(order.id) !== "CANCELLED" && order.status === "CANCELLED") {
        notifyAutoCancelled(order);
      }
    }
  }

  // Time-based alerts have no user action to hang off, so they are raised
  // here. Each carries a dedupe key, so they fire once rather than per read.
  reconcileOrderAlerts(orders);
  return orders;
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

function persist(order: Order): Order {
  const rows = readCollection<Order>("orders");
  writeCollection(
    "orders",
    rows.map((o) => (o.id === order.id ? order : o)),
    "update",
    order.id,
  );
  return order;
}

function withStatus(
  order: Order,
  status: OrderStatus,
  by: Pick<User, "id" | "name"> | null,
  reason?: string,
  extra: Partial<Order> = {},
): Order {
  const at = Date.now();
  return {
    ...order,
    ...extra,
    status,
    statusHistory: [...order.statusHistory, { status, at, byUserId: by?.id, reason }],
    updatedAt: new Date(at).toISOString(),
  };
}

function withPayment(order: Order, event: PaymentEvent, extra: Partial<Order>): Order {
  return {
    ...order,
    ...extra,
    paymentHistory: [...order.paymentHistory, event],
    updatedAt: new Date(event.at).toISOString(),
  };
}

export function isActiveStatus(status: OrderStatus): boolean {
  return (ACTIVE_ORDER_STATUSES as readonly OrderStatus[]).includes(status);
}

export function filterOrders(orders: Order[], filters: OrderFilters = {}): Order[] {
  let rows = [...orders];

  if (filters.customerId)
    rows = rows.filter((o) => o.customerId === filters.customerId);
  if (filters.orderType) rows = rows.filter((o) => o.orderType === filters.orderType);
  if (filters.paymentMethod)
    rows = rows.filter((o) => o.paymentMethod === filters.paymentMethod);
  if (filters.paymentStatus)
    rows = rows.filter((o) => o.paymentStatus === filters.paymentStatus);
  if (filters.scheduledOnly) rows = rows.filter((o) => o.isScheduled);

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
      [o.id, o.tokenNumber, o.pickupName, o.phone, o.tableNumber ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }

  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function listOrders(filters: OrderFilters = {}): Promise<Order[]> {
  await ready();
  return filterOrders(readOrders(), filters);
}

export async function listMyOrders(): Promise<Order[]> {
  await ready();
  const user = requireUser();
  return filterOrders(readOrders(), { customerId: user.id });
}

export async function getOrder(id: string): Promise<Order> {
  await ready();
  const order = readOrders().find((o) => o.id === id);
  if (!order) throw notFound(`Order ${id}`);
  return order;
}

/** Computed flags (overdue, due-to-start, blocked handover, …). */
export function flagsFor(order: Order, now = new Date()): OrderFlags {
  return deriveFlags(order, settings(), now);
}

/**
 * Provisional estimate shown before an admin has accepted the order. The real
 * promise is set by the admin on acceptance — this is only "usually about N".
 */
export async function getProvisionalEstimate(lines: CartLine[]): Promise<number> {
  await ready(false);
  const config = settings();
  return estimatePrepMinutes({
    prepMinutes: lines.map((line) => line.prepMinutes),
    activeOrders: countActiveOrders(),
    basePrepBufferMinutes: config.basePrepBufferMinutes,
    perActiveOrderMinutes: config.perActiveOrderMinutes,
  });
}

export interface PlaceOrderInput {
  lines: CartLine[];
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  pickupName: string;
  phone: string;
  notes?: string;
  couponCode?: string;
  tableNumber?: string;
  /** ISO slot start; takeaway only. */
  scheduledFor?: string;
}

/**
 * Creates the order.
 *
 * For an online payment this runs *after* the simulated gateway succeeded, so
 * the order is born PAID_UNVERIFIED carrying a reference the admin will check.
 * Dine-in cash is born UNPAID.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  await ready();
  const user = requireUser();
  const config = settings();

  if (input.lines.length === 0) throw invalid("Your cart is empty.");
  if (!config.acceptingOrders) {
    throw conflict("We've paused new orders for now. Please try again shortly.");
  }
  if (!isMethodAllowed(input.orderType, input.paymentMethod)) {
    throw invalid(
      input.orderType === "TAKEAWAY"
        ? "Takeaway orders are prepaid online — cash is only available for dine-in."
        : "That payment method isn't available for dine-in.",
      "paymentMethod",
    );
  }

  const isScheduled = !!input.scheduledFor;
  if (isScheduled) {
    if (input.orderType !== "TAKEAWAY") {
      throw invalid("Only takeaway orders can be scheduled.", "scheduledFor");
    }
    const slot = checkSlot(input.scheduledFor!, config, readOrders());
    if (!slot.ok) throw conflict(slot.reason ?? "That slot is not available.");
  }

  const availability = await validateCartAvailability(input.lines);
  if (!availability.ok) {
    const names = availability.unavailable.map((u) => u.name).join(", ");
    throw conflict(`${names} just sold out. Please remove it and try again.`);
  }

  const priced = await priceCart({
    lines: input.lines,
    couponCode: input.couponCode,
    orderType: input.orderType,
  });

  const online = isOnlineMethod(input.paymentMethod);
  const at = Date.now();
  const atIso = new Date(at).toISOString();
  const paymentRef = online ? generatePaymentRef() : undefined;

  const order: Order = {
    id: nextOrderNumber(),
    tokenNumber: nextTokenNumber(),
    customerId: user.id,
    orderType: input.orderType,
    tableNumber: input.orderType === "DINE_IN" ? input.tableNumber?.trim() : undefined,
    lines: toOrderLines(priced.lines),
    itemCount: priced.itemCount,
    subtotal: priced.subtotal,
    discount: priced.discount,
    couponCode: priced.appliedCouponCode,
    packagingCharge: priced.packagingCharge,
    taxRate: priced.taxRate,
    tax: priced.tax,
    total: priced.total,
    paymentMethod: input.paymentMethod,
    paymentStatus: online ? "PAID_UNVERIFIED" : "UNPAID",
    paymentRef,
    paymentHistory: online
      ? [
          {
            action: "ONLINE_PAID",
            method: input.paymentMethod,
            amount: priced.total,
            ref: paymentRef,
            at,
          },
        ]
      : [],
    status: "PLACED",
    statusHistory: [{ status: "PLACED", at }],
    // Deliberately unset for ASAP orders: the cafe promises a time on accept.
    estimatedReadyAt: isScheduled ? input.scheduledFor : undefined,
    readyTimeHistory: [],
    isScheduled,
    scheduledFor: input.scheduledFor,
    pickupName: input.pickupName.trim(),
    phone: input.phone.trim(),
    notes: input.notes?.trim() || undefined,
    stockDeducted: false,
    createdAt: atIso,
  };

  writeCollection(
    "orders",
    [...readCollection<Order>("orders"), order],
    "create",
    order.id,
  );
  if (priced.appliedCouponCode) recordCouponUse(priced.appliedCouponCode);
  notifyOrderPlaced(order);
  return order;
}

/* ---------------------------------------------------------------- */
/* Payment actions                                                   */
/* ---------------------------------------------------------------- */

/** Customer pays again after the cafe rejected the first attempt. */
export async function retryOnlinePayment(
  id: string,
  method: PaymentMethod,
): Promise<Order> {
  await ready();
  const user = requireUser();
  const order = await getOrder(id);

  if (order.customerId !== user.id) throw forbidden("That isn't your order.");
  if (order.status === "CANCELLED") {
    throw conflict("This order was cancelled. Please place a new one.");
  }
  if (order.paymentStatus !== "FAILED") {
    throw conflict("This order doesn't need another payment.");
  }
  if (!isOnlineMethod(method)) throw invalid("Choose UPI or card.", "paymentMethod");

  const ref = generatePaymentRef();
  return persist(
    withPayment(
      order,
      { action: "ONLINE_PAID", method, amount: order.total, ref, at: Date.now() },
      { paymentMethod: method, paymentStatus: "PAID_UNVERIFIED", paymentRef: ref },
    ),
  );
}

/** Dine-in customer decides to pay online instead of cash. */
export async function switchToOnline(
  id: string,
  method: PaymentMethod,
): Promise<Order> {
  await ready();
  const user = requireUser();
  const order = await getOrder(id);

  if (order.customerId !== user.id) throw forbidden("That isn't your order.");
  if (order.orderType !== "DINE_IN") throw conflict("Only dine-in orders can switch.");
  /*
    Online → cash is deliberately not offered: money already taken online
    would have to be refunded first, which this prototype does not simulate.
  */
  if (order.paymentMethod !== "CASH" || order.paymentStatus !== "UNPAID") {
    throw conflict("This order can't be switched to online payment.");
  }
  if (order.status === "CANCELLED" || order.status === "HANDED_OVER") {
    throw conflict("This order is already closed.");
  }
  if (!isOnlineMethod(method)) throw invalid("Choose UPI or card.", "paymentMethod");

  const ref = generatePaymentRef();
  const switched = persist(
    withPayment(
      order,
      {
        action: "SWITCHED_TO_ONLINE",
        method,
        amount: order.total,
        ref,
        at: Date.now(),
      },
      { paymentMethod: method, paymentStatus: "PAID_UNVERIFIED", paymentRef: ref },
    ),
  );
  notifySwitchedToOnline(switched);
  return switched;
}

/** Admin confirms the money landed. */
export async function verifyPayment(id: string): Promise<Order> {
  await ready();
  const admin = requirePermission("ORDERS");
  const order = await getOrder(id);

  if (order.paymentStatus !== "PAID_UNVERIFIED") {
    throw conflict("There is no online payment waiting to be verified.");
  }

  const verified = persist(
    withPayment(
      order,
      {
        action: "PAYMENT_VERIFIED",
        method: order.paymentMethod,
        amount: order.total,
        ref: order.paymentRef,
        byUserId: admin.id,
        at: Date.now(),
      },
      { paymentStatus: "VERIFIED" },
    ),
  );
  logActivity(admin, "PAYMENT_VERIFIED", `Verified payment for ${id}`, id);
  return verified;
}

/** Admin rejects the claimed payment; the customer may pay again. */
export async function rejectPayment(id: string, reason: string): Promise<Order> {
  await ready();
  const admin = requirePermission("ORDERS");
  const order = await getOrder(id);

  if (!reason.trim()) {
    throw invalid("Give a reason for rejecting the payment.", "reason");
  }
  if (order.paymentStatus !== "PAID_UNVERIFIED") {
    throw conflict("There is no online payment waiting to be verified.");
  }

  const rejected = persist(
    withPayment(
      order,
      {
        action: "PAYMENT_REJECTED",
        method: order.paymentMethod,
        amount: order.total,
        ref: order.paymentRef,
        reason: reason.trim(),
        byUserId: admin.id,
        at: Date.now(),
      },
      { paymentStatus: "FAILED" },
    ),
  );
  notifyPaymentRejected(rejected, settings().unpaidTakeawayTimeoutMinutes);
  logActivity(admin, "PAYMENT_REJECTED", `Rejected payment for ${id}: ${reason}`, id);
  return rejected;
}

/** Admin takes cash at the counter; change is worked out for them. */
export async function recordCashPayment(
  id: string,
  amountReceived: number,
): Promise<Order> {
  await ready();
  const admin = requirePermission("ORDERS");
  const order = await getOrder(id);

  if (order.paymentMethod !== "CASH") throw conflict("This is not a cash order.");
  if (order.paymentStatus === "VERIFIED") throw conflict("This order is already paid.");
  if (amountReceived < order.total) {
    throw invalid(`That is less than the bill of ₹${order.total}.`, "amountReceived");
  }

  const change = amountReceived - order.total;
  const paid = persist(
    withPayment(
      order,
      {
        action: "CASH_RECEIVED",
        method: "CASH",
        amount: amountReceived,
        byUserId: admin.id,
        at: Date.now(),
      },
      {
        paymentStatus: "VERIFIED",
        cashReceived: amountReceived,
        changeReturned: change,
      },
    ),
  );
  logActivity(admin, "CASH_RECEIVED", `Took ₹${amountReceived} cash for ${id}`, id);
  return paid;
}

/* ---------------------------------------------------------------- */
/* Kitchen actions                                                   */
/* ---------------------------------------------------------------- */

function assertReadyMinutes(minutes: number): void {
  if (
    !Number.isFinite(minutes) ||
    minutes < MIN_READY_MINUTES ||
    minutes > MAX_READY_MINUTES
  ) {
    throw invalid(
      `Set a ready time between ${MIN_READY_MINUTES} and ${MAX_READY_MINUTES} minutes.`,
      "readyInMinutes",
    );
  }
}

export interface AcceptOptions {
  /** Proceed even though stock would go negative; requires a reason. */
  overrideShortfall?: boolean;
  overrideReason?: string;
}

/**
 * Accepts an order and promises a ready time.
 *
 * `readyInMinutes` is required: the admin, not the algorithm, decides what the
 * customer is told. Scheduled orders ignore it — their ready time is the slot.
 */
export async function accept(
  id: string,
  readyInMinutes: number,
  options: AcceptOptions = {},
): Promise<Order> {
  await ready();
  const admin = requirePermission("ORDERS");
  const config = settings();
  const order = await getOrder(id);

  if (order.status !== "PLACED") {
    throw conflict(`Order ${id} has already been ${order.status.toLowerCase()}.`);
  }

  const gate = canStartKitchen(order, config);
  if (!gate.ok) throw paymentNotVerified(gate.reason!);

  if (!order.isScheduled) assertReadyMinutes(readyInMinutes);

  const shortfall = projectShortfall(order);
  if (shortfall.length > 0 && !options.overrideShortfall) {
    throw conflict(
      `Not enough stock for: ${shortfall.map((s) => s.item.name).join(", ")}. Accept anyway to override.`,
    );
  }
  if (shortfall.length > 0 && !options.overrideReason?.trim()) {
    throw invalid("Give a reason for overriding the stock warning.", "overrideReason");
  }

  const at = Date.now();
  const estimatedReadyAt = order.isScheduled
    ? order.scheduledFor!
    : new Date(at + readyInMinutes * 60_000).toISOString();

  const accepted = persist(
    withStatus(order, "ACCEPTED", admin, options.overrideReason, {
      estimatedReadyAt,
      readyTimeSetBy: admin.id,
      readyTimeHistory: order.isScheduled
        ? order.readyTimeHistory
        : [
            ...order.readyTimeHistory,
            { minutes: readyInMinutes, at, byUserId: admin.id },
          ],
      stockDeducted: true,
    }),
  );

  deductForOrder(accepted, admin.id);
  notifyOrderAccepted(accepted);
  logActivity(
    admin,
    "ORDER_ACCEPTED",
    `Accepted ${id}, ready in ${readyInMinutes} min`,
    id,
  );
  return accepted;
}

/** The single action behind the admin's "Verify & accept" button. */
export async function verifyAndAccept(
  id: string,
  readyInMinutes: number,
  options: AcceptOptions = {},
): Promise<Order> {
  await verifyPayment(id);
  return accept(id, readyInMinutes, options);
}

/** +5 / +10 when the kitchen is running late. Pushed to the customer live. */
export async function extendReadyTime(
  id: string,
  extraMinutes: number,
  reason?: string,
): Promise<Order> {
  await ready();
  const admin = requirePermission("ORDERS");
  const order = await getOrder(id);

  if (!order.estimatedReadyAt) {
    throw conflict("Accept the order before changing its ready time.");
  }
  if (order.status === "HANDED_OVER" || order.status === "CANCELLED") {
    throw conflict("This order is already closed.");
  }
  assertReadyMinutes(extraMinutes);

  const at = Date.now();
  const extended = persist({
    ...order,
    estimatedReadyAt: new Date(
      Date.parse(order.estimatedReadyAt) + extraMinutes * 60_000,
    ).toISOString(),
    readyTimeSetBy: admin.id,
    readyTimeHistory: [
      ...order.readyTimeHistory,
      { minutes: extraMinutes, at, byUserId: admin.id, reason },
    ],
    updatedAt: new Date(at).toISOString(),
  });

  notifyReadyTimeExtended(extended, extraMinutes);
  logActivity(admin, "READY_TIME_EXTENDED", `Added ${extraMinutes} min to ${id}`, id);
  return extended;
}

/** Forward transition for the board's one-click buttons. */
export async function advanceOrder(id: string, status: OrderStatus): Promise<Order> {
  await ready();
  const admin = requirePermission("ORDERS");
  const config = settings();
  const order = await getOrder(id);

  if (status === "ACCEPTED") throw invalid("Use accept() so a ready time is recorded.");
  if (status === "CANCELLED") throw invalid("Use cancelOrder so a reason is recorded.");
  if (!NEXT_STATUS[order.status].includes(status)) {
    throw conflict(`Order ${id} cannot go from ${order.status} to ${status}.`);
  }

  if (status === "PREPARING") {
    const gate = canStartKitchen(order, config);
    if (!gate.ok) throw paymentNotVerified(gate.reason!);
  }
  if (status === "HANDED_OVER") {
    const gate = canHandOver(order);
    if (!gate.ok) throw paymentNotVerified(gate.reason!);
  }

  const next = persist(withStatus(order, status, admin));
  notifyStatusChange(next);
  logActivity(admin, `ORDER_${status}`, `Marked ${id} as ${status.toLowerCase()}`, id);
  return next;
}

/** Marking ready early is allowed, so this is just a guarded transition. */
export async function markReady(id: string): Promise<Order> {
  return advanceOrder(id, "READY");
}

/** "Picked up" for takeaway, "Served" for dine-in. */
export async function handOver(id: string): Promise<Order> {
  return advanceOrder(id, "HANDED_OVER");
}

/**
 * Cancellation. Admins may cancel any open order. A customer may cancel their
 * own before the kitchen accepts it, or — for a scheduled order — until the
 * cutoff before the slot.
 */
export async function cancelOrder(id: string, reason: string): Promise<Order> {
  await ready();
  const user = requireUser();
  const config = settings();
  const order = await getOrder(id);

  if (!reason.trim()) {
    throw invalid("Please give a reason for the cancellation.", "reason");
  }
  if (order.status === "CANCELLED") throw conflict("That order is already cancelled.");
  if (order.status === "HANDED_OVER") throw conflict("That order is already closed.");

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (!isAdmin) {
    if (order.customerId !== user.id) {
      throw forbidden("You can only cancel your own orders.");
    }
    if (order.isScheduled) {
      const deadline = scheduleCancelDeadline(
        order,
        config.scheduleCancelCutoffMinutes,
      );
      if (deadline && Date.now() >= deadline.getTime()) {
        throw conflict(
          `Scheduled orders can only be cancelled up to ${config.scheduleCancelCutoffMinutes} minutes before pickup. Please call the store.`,
        );
      }
    } else if (order.status !== "PLACED") {
      throw conflict(
        "The kitchen has already started this order. Please call the store.",
      );
    }
  }

  const refunding = needsRefund(order.paymentStatus);
  const at = Date.now();

  let cancelled = withStatus(order, "CANCELLED", isAdmin ? user : null, reason, {
    stockDeducted: false,
  });
  if (refunding) {
    cancelled = withPayment(
      cancelled,
      {
        action: "REFUNDED",
        method: order.paymentMethod,
        amount: order.total,
        ref: order.paymentRef,
        reason: reason.trim(),
        byUserId: isAdmin ? user.id : undefined,
        at,
      },
      { paymentStatus: "REFUNDED" },
    );
  }
  persist(cancelled);

  if (order.stockDeducted) restockForOrder(order, user.id);
  notifyOrderCancelled(cancelled, reason.trim());
  if (isAdmin) logActivity(user, "ORDER_CANCELLED", `Cancelled ${id}: ${reason}`, id);

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
    /*
      Orders store only the option ids, so the line is rebuilt from the live
      menu item. That also re-prices it, which is what a customer reordering
      a two-month-old order should get.
    */
    const optionIds = line.options
      .map((option) => option.id)
      .filter((id) =>
        item.optionGroups.some((group) => group.options.some((o) => o.id === id)),
      );
    try {
      lines.push(buildCartLine(item, optionIds, line.quantity, line.notes));
    } catch {
      // A required group changed since the order was placed — let the
      // customer re-pick rather than silently dropping the item.
      skipped.push(line.name.en);
    }
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
    HANDED_OVER: 0,
    CANCELLED: 0,
  } satisfies Record<OrderStatus, number>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const order of readOrders()) {
    if (
      Date.parse(order.createdAt) >= today.getTime() ||
      isActiveStatus(order.status)
    ) {
      counts[order.status] += 1;
    }
  }
  return counts;
}

export function canCustomerCancel(order: Order): boolean {
  const user = getCurrentUser();
  if (!user || order.customerId !== user.id) return false;
  return flagsFor(order).canCustomerCancel;
}

/** Bookable scheduled-takeaway slots for one date. */
export async function getAvailableSlots(date: Date): Promise<ScheduleSlot[]> {
  await ready(false);
  return buildSlotsForDate(date, settings(), readOrders());
}

/** Today and tomorrow, which is as far ahead as scheduling is offered. */
export async function getSchedulableDays(): Promise<
  Array<{ date: string; slots: ScheduleSlot[] }>
> {
  await ready(false);
  return buildSchedulableDays(settings());
}

export { isPaymentVerified };
export type { ScheduleSlot };
