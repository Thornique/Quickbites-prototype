import { toDateKey } from "@/lib/format";
import { OUTLETS } from "@/lib/outlets";
import { readCollection, writeCollection } from "@/storage";
import type {
  Order,
  OrderLine,
  OutletId,
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

/** The counter key for one outlet on one day. */
export function tokenCounterId(outletId: OutletId, now = new Date()): string {
  return `token:${outletId}:${toDateKey(now)}`;
}

/**
 * Short counter token, reset each day and counted separately per outlet:
 * A01…A99 then B01… at the restaurant, C01…C99 then D01… at the coffee shop.
 * Two outlets calling "A12" across the same counter would be chaos, so the
 * series start apart and each one has 198 tokens before it could meet the
 * other — far more than a day's trade at either.
 */
export function nextTokenNumber(outletId: OutletId, now = new Date()): string {
  const key = tokenCounterId(outletId, now);
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

  return formatToken(value, outletId);
}

export function formatToken(sequence: number, outletId: OutletId): string {
  const base = OUTLETS[outletId].tokenPrefix.charCodeAt(0);
  const letter = String.fromCharCode(base + Math.floor((sequence - 1) / 99));
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

/** The settings fields the derived flags depend on. */
export type FlagSettingKeys =
  "basePrepBufferMinutes" | "scheduleCancelCutoffMinutes" | "verificationAlertMinutes";

/**
 * Looks up one outlet's settings. Order lists now mix both outlets — on the
 * super admin's combined board, at least — so a rule that depends on the
 * cafe's configuration has to ask per order rather than be handed one record.
 */
export type SettingsLookup<K extends keyof StoreSettings> = (
  outletId: OutletId,
) => Pick<StoreSettings, K>;

/** Everything the UI needs to know that is computed rather than stored. */
export function deriveFlags(
  order: Order,
  settings: Pick<StoreSettings, FlagSettingKeys>,
  now = new Date(),
): OrderFlags {
  const open = isOpenStatus(order);

  const promisedPassed =
    !!order.estimatedReadyAt && now.getTime() > Date.parse(order.estimatedReadyAt);
  const isOverdue = open && promisedPassed && order.status === "PREPARING";

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
  settingsOf: SettingsLookup<"unpaidTakeawayTimeoutMinutes">,
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

    const timeout = settingsOf(order.outletId).unpaidTakeawayTimeoutMinutes;
    const deadline = rejectedAt + timeout * 60_000;
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
          reason: `Payment not completed within ${timeout} minutes.`,
        },
      ],
      updatedAt: now.toISOString(),
    };
  });

  return { orders: next, changed };
}

/**
 * Moves scheduled orders into the kitchen when their slot comes round.
 *
 * Evaluated on every read, for the same reason as applyAutoCancellations:
 * there is no server to run a timer. A scheduled order sits on the Scheduled
 * tab until it is due, and nobody at the counter should have to remember to
 * press start at half past seven.
 *
 * Only payment-verified orders move — isDueToStart already requires it, which
 * is what keeps an unpaid slot from quietly entering the kitchen.
 */
export function applyScheduledStarts(
  orders: Order[],
  settingsOf: SettingsLookup<FlagSettingKeys>,
  now = new Date(),
): { orders: Order[]; started: Order[] } {
  const started: Order[] = [];

  const next = orders.map((order) => {
    if (!order.isScheduled) return order;
    if (!deriveFlags(order, settingsOf(order.outletId), now).isDueToStart) return order;

    const at = now.getTime();
    // Attributed to whoever set the ready time; nobody pressed anything now.
    const byUserId = order.readyTimeSetBy;
    const history = [...order.statusHistory];
    if (!history.some((event) => event.status === "ACCEPTED")) {
      history.push({ status: "ACCEPTED", at, byUserId });
    }
    history.push({ status: "PREPARING", at, byUserId });

    const updated: Order = {
      ...order,
      status: "PREPARING",
      statusHistory: history,
      updatedAt: new Date(at).toISOString(),
    };
    started.push(updated);
    return updated;
  });

  return { orders: next, started };
}

/**
 * Status transitions the board is allowed to make.
 *
 * ACCEPTED is no longer a resting state for an immediate order: accepting one
 * sends it straight to the kitchen. It survives as the state a *scheduled*
 * order holds between being accepted and its slot coming round, and as a
 * milestone in statusHistory that reports measure the promise from.
 */
export const NEXT_STATUS: Record<Order["status"], Order["status"][]> = {
  PLACED: ["ACCEPTED", "PREPARING", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
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
