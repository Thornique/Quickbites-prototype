import { formatTime } from "@/lib/format";
import { readCollection, readSingleton } from "@/storage";
import type { Order, StoreSettings } from "@/types";
import { notify, notifyAdmins } from "./notifications";
import { deriveFlags, isOpenStatus } from "./order-rules";

/**
 * Notification triggers for orders.
 *
 * Kept out of orders.ts so the order service stays about orders, and so the
 * derived alerts (overdue, stale verification, due-to-start, scheduled
 * reminder) live next to each other — they share the same "fire exactly once"
 * problem and the same dedupe key convention.
 */

const customerLink = (order: Order) => `/order/${order.id}`;
const adminLink = "/admin/orders";

function at(order: Order): string | undefined {
  return order.estimatedReadyAt ? formatTime(order.estimatedReadyAt) : undefined;
}

function base(order: Order) {
  return { orderId: order.id, token: order.tokenNumber };
}

/* ---- Direct triggers, called from the matching service action ------- */

export function notifyOrderPlaced(order: Order): void {
  notifyAdmins("ORDERS", {
    type: "NEW_ORDER",
    params: { ...base(order), amount: order.total },
    link: adminLink,
    priority: "high",
    dedupeKey: `new:${order.id}`,
  });

  if (order.paymentStatus === "PAID_UNVERIFIED") {
    notifyAdmins("ORDERS", {
      type: "PAYMENT_AWAITING",
      params: { ...base(order), amount: order.total },
      link: adminLink,
      dedupeKey: `await:${order.id}`,
    });
  }
  if (order.paymentMethod === "CASH") {
    notifyAdmins("ORDERS", {
      type: "CASH_TO_COLLECT",
      params: { ...base(order), amount: order.total },
      link: adminLink,
      dedupeKey: `cash:${order.id}`,
    });
  }
}

export function notifyOrderAccepted(order: Order): void {
  notify({
    userId: order.customerId,
    type: "ORDER_CONFIRMED",
    params: { ...base(order), time: at(order) },
    link: customerLink(order),
    dedupeKey: `confirmed:${order.id}`,
  });
}

export function notifyPaymentRejected(order: Order, minutesToPay: number): void {
  notify({
    userId: order.customerId,
    type: "PAYMENT_REJECTED",
    params: { ...base(order), minutes: minutesToPay },
    link: customerLink(order),
    priority: "high",
  });
}

export function notifyReadyTimeExtended(order: Order, extraMinutes: number): void {
  notify({
    userId: order.customerId,
    type: "READY_TIME_EXTENDED",
    params: { ...base(order), minutes: extraMinutes, time: at(order) },
    link: customerLink(order),
  });
}

export function notifyStatusChange(order: Order): void {
  if (order.status === "PREPARING") {
    notify({
      userId: order.customerId,
      type: "ORDER_PREPARING",
      params: base(order),
      link: customerLink(order),
      dedupeKey: `preparing:${order.id}`,
    });
  }
  if (order.status === "READY") {
    notify({
      userId: order.customerId,
      type: "ORDER_READY",
      params: base(order),
      link: customerLink(order),
      priority: "high",
      dedupeKey: `ready:${order.id}`,
    });
  }
  if (order.status === "HANDED_OVER") {
    notify({
      userId: order.customerId,
      type: "ORDER_HANDED_OVER",
      params: base(order),
      link: `/account/orders`,
      dedupeKey: `done:${order.id}`,
    });
  }
}

export function notifyOrderCancelled(order: Order, reason: string): void {
  notify({
    userId: order.customerId,
    type: "ORDER_CANCELLED",
    params: { ...base(order), reason },
    link: customerLink(order),
    priority: "high",
    dedupeKey: `cancelled:${order.id}`,
  });
}

export function notifyAutoCancelled(order: Order): void {
  notifyOrderCancelled(order, "Payment was not completed in time.");
  notifyAdmins("ORDERS", {
    type: "TAKEAWAY_AUTO_CANCELLED",
    params: base(order),
    link: adminLink,
    dedupeKey: `autocancel:${order.id}`,
  });
}

export function notifySwitchedToOnline(order: Order): void {
  notifyAdmins("ORDERS", {
    type: "SWITCHED_TO_ONLINE",
    params: { ...base(order), amount: order.total },
    link: adminLink,
    dedupeKey: `switched:${order.id}`,
  });
  notifyAdmins("ORDERS", {
    type: "PAYMENT_AWAITING",
    params: { ...base(order), amount: order.total },
    link: adminLink,
    dedupeKey: `await:${order.id}:online`,
  });
}

/* ---- Derived alerts, evaluated on read ------------------------------ */

/**
 * Raises the time-based alerts that no user action triggers.
 *
 * There is no server to run a scheduler, so this runs whenever orders are
 * read. Every alert carries a dedupe key, so an order that has been overdue
 * for an hour produces exactly one notification rather than one per refresh.
 */
export function reconcileOrderAlerts(orders: Order[], now = new Date()): void {
  const settings = readSingleton<StoreSettings>("storeSettings");
  if (!settings) return;

  const staleAfterMs = settings.verificationAlertMinutes * 60_000;

  for (const order of orders) {
    if (!isOpenStatus(order)) continue;
    const flags = deriveFlags(order, settings, now);

    // Payment waiting too long for someone to confirm it.
    if (
      flags.awaitingVerification &&
      now.getTime() - Date.parse(order.createdAt) > staleAfterMs
    ) {
      notifyAdmins("ORDERS", {
        type: "PAYMENT_STALE",
        params: { ...base(order), minutes: settings.verificationAlertMinutes },
        link: adminLink,
        priority: "high",
        dedupeKey: `stale:${order.id}`,
      });
    }

    if (flags.isOverdue) {
      notifyAdmins("ORDERS", {
        type: "ORDER_OVERDUE",
        params: { ...base(order), time: at(order) },
        link: adminLink,
        priority: "high",
        dedupeKey: `overdue:${order.id}`,
      });
    }

    if (flags.isDueToStart) {
      notifyAdmins("ORDERS", {
        type: "SCHEDULED_DUE",
        params: { ...base(order), time: at(order) },
        link: adminLink,
        priority: "high",
        dedupeKey: `due:${order.id}`,
      });
    }

    // Customer reminder, 30 minutes before a scheduled pickup.
    if (order.isScheduled && order.scheduledFor) {
      const minutesAway = (Date.parse(order.scheduledFor) - now.getTime()) / 60_000;
      if (minutesAway <= 30 && minutesAway > 0) {
        notify({
          userId: order.customerId,
          type: "SCHEDULED_REMINDER",
          params: { ...base(order), time: formatTime(order.scheduledFor) },
          link: customerLink(order),
          dedupeKey: `remind:${order.id}`,
        });
      }
    }
  }
}

/** Low/out-of-stock alerts, raised after an inventory movement. */
export function notifyStockLevels(
  changed: Array<{ id: string; name: string; qty: number; lowStockThreshold: number }>,
): void {
  for (const item of changed) {
    if (item.qty <= 0) {
      notifyAdmins("INVENTORY", {
        type: "INVENTORY_OUT",
        params: { item: item.name },
        link: "/admin/inventory",
        priority: "high",
        dedupeKey: `out:${item.id}`,
      });
    } else if (item.qty <= item.lowStockThreshold) {
      notifyAdmins("INVENTORY", {
        type: "INVENTORY_LOW",
        params: { item: item.name },
        link: "/admin/inventory",
        dedupeKey: `low:${item.id}:${Math.ceil(item.qty)}`,
      });
    }
  }
}

/** Used by the dev tools to confirm nothing is double-firing. */
export function countOpenOrders(): number {
  return readCollection<Order>("orders").filter(isOpenStatus).length;
}
