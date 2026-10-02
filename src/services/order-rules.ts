import { toDateKey } from "@/lib/format";
import { readCollection, writeCollection } from "@/storage";
import type {
  Order,
  OrderLine,
  OrderFlags,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  StoreSettings,
} from "@/types";
import type { PricedCartLine } from "@/types";
import { isOnlineMethod } from "@/types";

/**
 * Freezes priced cart lines into the compact snapshot an order keeps.
 *
 * The image path, slug, lineKey and option group ids are all re-derivable
 * from menuItemId, so they are dropped — stored 500 times over they were the
 * single largest thing in localStorage.
 */
export function toOrderLines(lines: PricedCartLine[]): OrderLine[] {
  return lines.map((line) => ({
    menuItemId: line.menuItemId,
    name: line.name,
    isVeg: line.isVeg,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    options: line.selectedOptions.map((option) => ({
      id: option.optionId,
      name: option.optionName,
      priceDelta: option.priceDelta,
    })),
    unitTotal: line.unitTotal,
    lineTotal: line.lineTotal,
    prepMinutes: line.prepMinutes,
    notes: line.notes,
  }));
}

/**
 * Pure rules shared by the order service, the seed generator and reports.
 * Keeping them here means "can the kitchen start this?" has exactly one
 * answer, whether it is being asked by a button, a guard or a report.
 */

/** Which payment methods each order type may use. */
export function allowedMethodsFor(orderType: OrderType): PaymentMethod[] {
  // Takeaway is prepaid online only: food is never cooked for a customer who
  // might not turn up. Dine-in may pay cash because they are already here.
  return orderType === "TAKEAWAY"
    ? ["ONLINE_UPI", "ONLINE_CARD"]
    : ["ONLINE_UPI", "ONLINE_CARD", "CASH"];
}

export function isMethodAllowed(orderType: OrderType, method: PaymentMethod): boolean {
  return allowedMethodsFor(orderType).includes(method);
}

/** A 12-digit reference, as a real gateway would return. */
export function generatePaymentRef(): string {
  let ref = "";
  for (let i = 0; i < 12; i += 1) ref += Math.floor(Math.random() * 10);
  return ref;
}

/**
 * Short counter token, reset each day: A01…A99, then B01…
 * Stored per date so two days never collide.
 */
export function nextTokenNumber(now = new Date()): string {
  const key = `token:${toDateKey(now)}`;
  const counters = readCollection<{ id: string; value: number }>("counters");
  const current = counters.find((c) => c.id === key)?.value ?? 0;
  const value = current + 1;

  writeCollection(
    "counters",
    counters.some((c) => c.id === key)
      ? counters.map((c) => (c.id === key ? { ...c, value } : c))
      : [...counters, { id: key, value }],
    "update",
  );

  return formatToken(value);
}

export function formatToken(sequence: number): string {
  const letter = String.fromCharCode(65 + Math.floor((sequence - 1) / 99));
  const number = ((sequence - 1) % 99) + 1;
  return `${letter}${String(number).padStart(2, "0")}`;
}

/** Money is confirmed in hand or in the account. */
export function isPaymentVerified(order: Order): boolean {
  return order.paymentStatus === "VERIFIED";
}

/**
 * Whether the kitchen may begin work.
 *
 * - Takeaway always needs verified payment, whatever the method.
 * - Dine-in cash may start immediately unless the cafe has turned on
 *   requirePaymentBeforePrepForCash.
 * - Dine-in online behaves like takeaway: verify, then cook.
 */
export function canStartKitchen(
  order: Order,
  settings: Pick<StoreSettings, "requirePaymentBeforePrepForCash">,
): { ok: boolean; reason?: string } {
  if (isPaymentVerified(order)) return { ok: true };

  if (order.orderType === "TAKEAWAY") {
    return {
      ok: false,
      reason: "This takeaway order is prepaid — verify the payment before starting it.",
    };
  }

  if (order.paymentMethod === "CASH") {
    if (settings.requirePaymentBeforePrepForCash) {
      return {
        ok: false,
        reason: "Take the cash before starting this order.",
      };
    }
    return { ok: true };
  }

  return { ok: false, reason: "Verify the online payment before starting this order." };
}

/** Nothing leaves the counter until the money is confirmed. */
export function canHandOver(order: Order): { ok: boolean; reason?: string } {
  if (isPaymentVerified(order)) return { ok: true };
  return {
    ok: false,
    reason:
      order.paymentMethod === "CASH"
        ? "Record the cash payment before handing this order over."
        : "Verify the payment before handing this order over.",
  };
}

/** When a scheduled order must enter the kitchen to be ready on time. */
export function scheduledStartAt(
  order: Order,
  basePrepBufferMinutes: number,
): Date | null {
  if (!order.isScheduled || !order.scheduledFor) return null;
  const slowestItem = order.lines.reduce(
    (max, line) => Math.max(max, line.prepMinutes),
    0,
  );
  const lead = (slowestItem + basePrepBufferMinutes) * 60_000;
  return new Date(Date.parse(order.scheduledFor) - lead);
}

/** The point after which a customer may no longer cancel a scheduled order. */
export function scheduleCancelDeadline(
  order: Order,
  cutoffMinutes: number,
): Date | null {
  if (!order.isScheduled || !order.scheduledFor) return null;
  return new Date(Date.parse(order.scheduledFor) - cutoffMinutes * 60_000);
}

export function isOpenStatus(order: Order): boolean {
  return order.status !== "HANDED_OVER" && order.status !== "CANCELLED";
}

/** Everything the UI needs to know that is computed rather than stored. */
export function deriveFlags(
  order: Order,
  settings: Pick<
    StoreSettings,
    "basePrepBufferMinutes" | "scheduleCancelCutoffMinutes" | "verificationAlertMinutes"
  >,
  now = new Date(),
): OrderFlags {
  const open = isOpenStatus(order);

  const promisedPassed =
    !!order.estimatedReadyAt && now.getTime() > Date.parse(order.estimatedReadyAt);
  const isOverdue =
    open &&
    promisedPassed &&
    (order.status === "ACCEPTED" || order.status === "PREPARING");

  const startAt = scheduledStartAt(order, settings.basePrepBufferMinutes);
  const isDueToStart =
    open &&
    order.isScheduled &&
    isPaymentVerified(order) &&
    (order.status === "PLACED" || order.status === "ACCEPTED") &&
    !!startAt &&
    now.getTime() >= startAt.getTime();

  const awaitingVerification = open && order.paymentStatus === "PAID_UNVERIFIED";
  const isStalePending =
    awaitingVerification &&
    now.getTime() - Date.parse(order.createdAt) >
      settings.verificationAlertMinutes * 60_000;
  const cashPending =
    open && order.paymentMethod === "CASH" && order.paymentStatus === "UNPAID";
  const blockedFromHandover = order.status === "READY" && !isPaymentVerified(order);

  const deadline = scheduleCancelDeadline(order, settings.scheduleCancelCutoffMinutes);
  const canCustomerCancel =
    open &&
    (order.isScheduled
      ? !!deadline && now.getTime() < deadline.getTime()
      : order.status === "PLACED");

  return {
    isOverdue,
    isDueToStart,
    awaitingVerification,
    isStalePending,
    cashPending,
    blockedFromHandover,
    canCustomerCancel,
  };
}

/**
 * Auto-cancels takeaway orders whose payment was rejected and never retried.
 *
 * There is no server to run a timer, so the rule is evaluated whenever orders
 * are read. Returns the (possibly unchanged) rows and only writes when
 * something actually changed, so this cannot loop through the sync channel.
 */
export function applyAutoCancellations(
  orders: Order[],
  settings: Pick<StoreSettings, "unpaidTakeawayTimeoutMinutes">,
  now = new Date(),
): { orders: Order[]; changed: boolean } {
  let changed = false;

  const next = orders.map((order) => {
    if (order.orderType !== "TAKEAWAY") return order;
    if (order.paymentStatus !== "FAILED" || !isOpenStatus(order)) return order;

    const rejectedAt = [...order.paymentHistory]
      .reverse()
      .find((event) => event.action === "PAYMENT_REJECTED")?.at;
    if (!rejectedAt) return order;

    const deadline = rejectedAt + settings.unpaidTakeawayTimeoutMinutes * 60_000;
    if (now.getTime() <= deadline) return order;

    changed = true;
    const at = now.getTime();
    return {
      ...order,
      status: "CANCELLED" as const,
      statusHistory: [
        ...order.statusHistory,
        {
          status: "CANCELLED" as const,
          at,
          reason: `Payment not completed within ${settings.unpaidTakeawayTimeoutMinutes} minutes.`,
        },
      ],
      updatedAt: now.toISOString(),
    };
  });

  return { orders: next, changed };
}

/** Status transitions the board is allowed to make. */
export const NEXT_STATUS: Record<Order["status"], Order["status"][]> = {
  PLACED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "READY", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["HANDED_OVER", "CANCELLED"],
  HANDED_OVER: [],
  CANCELLED: [],
};

/** Paid money that must be returned when an order is cancelled. */
export function needsRefund(status: PaymentStatus): boolean {
  return status === "VERIFIED" || status === "PAID_UNVERIFIED";
}

export { isOnlineMethod };
