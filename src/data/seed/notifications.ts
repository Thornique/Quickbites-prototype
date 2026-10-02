import { formatSlotLabel } from "@/lib/format";
import type { AppNotification, Order } from "@/types";

const MINUTE = 60_000;

/**
 * A handful of notifications so the bell is not empty on first load.
 *
 * Seeded only for the three demo accounts — giving all forty customers a
 * notification history would cost storage nobody will ever look at.
 */
export function buildSeedNotifications(orders: Order[], now: Date): AppNotification[] {
  const out: AppNotification[] = [];
  let sequence = 0;

  const add = (
    recipientUserId: string,
    partial: Omit<AppNotification, "id" | "recipientUserId" | "createdAt"> & {
      minutesAgo: number;
    },
  ) => {
    const { minutesAgo, ...rest } = partial;
    sequence += 1;
    out.push({
      ...rest,
      id: `ntf-seed-${String(sequence).padStart(3, "0")}`,
      recipientUserId,
      createdAt: now.getTime() - minutesAgo * MINUTE,
    });
  };

  // ---- Customer: the demo account's recent order activity ---------------
  const demoOrders = orders
    .filter((o) => o.customerId === "user-demo")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const [latest, previous] = demoOrders;

  if (latest) {
    add("user-demo", {
      type: "ORDER_HANDED_OVER",
      params: { orderId: latest.id, token: latest.tokenNumber },
      link: "/account/orders",
      priority: "normal",
      minutesAgo: 95,
      readAt: now.getTime() - 80 * MINUTE,
    });
    add("user-demo", {
      type: "ORDER_READY",
      params: { orderId: latest.id, token: latest.tokenNumber },
      link: `/order/${latest.id}`,
      priority: "high",
      minutesAgo: 110,
      readAt: now.getTime() - 100 * MINUTE,
    });
  }
  if (previous) {
    // Deliberately unread, so the bell shows a badge on first load.
    add("user-demo", {
      type: "ORDER_CONFIRMED",
      params: { orderId: previous.id, token: previous.tokenNumber, time: "7:42 PM" },
      link: `/order/${previous.id}`,
      priority: "normal",
      minutesAgo: 40,
    });
  }
  add("user-demo", {
    type: "BOOKING_CONFIRMED",
    params: { time: formatSlotLabel("19:30") },
    link: "/account",
    priority: "normal",
    minutesAgo: 1500,
    readAt: now.getTime() - 1400 * MINUTE,
  });

  // ---- Admins: the live board's open work -------------------------------
  const open = orders.filter(
    (o) => o.status !== "HANDED_OVER" && o.status !== "CANCELLED",
  );
  const awaiting = open.find((o) => o.paymentStatus === "PAID_UNVERIFIED");
  const cash = open.find(
    (o) => o.paymentMethod === "CASH" && o.paymentStatus === "UNPAID",
  );
  const overdue = open.find((o) => o.status === "PREPARING");

  for (const adminId of ["user-owner", "user-manager"]) {
    if (awaiting) {
      add(adminId, {
        type: "PAYMENT_AWAITING",
        params: {
          orderId: awaiting.id,
          token: awaiting.tokenNumber,
          amount: awaiting.total,
        },
        link: "/admin/orders",
        priority: "normal",
        dedupeKey: `await:${awaiting.id}`,
        minutesAgo: 4,
      });
    }
    if (cash) {
      add(adminId, {
        type: "CASH_TO_COLLECT",
        params: { orderId: cash.id, token: cash.tokenNumber, amount: cash.total },
        link: "/admin/orders",
        priority: "normal",
        dedupeKey: `cash:${cash.id}`,
        minutesAgo: 12,
      });
    }
    if (overdue) {
      add(adminId, {
        type: "ORDER_OVERDUE",
        params: { orderId: overdue.id, token: overdue.tokenNumber },
        link: "/admin/orders",
        priority: "high",
        dedupeKey: `overdue:${overdue.id}`,
        minutesAgo: 2,
      });
    }
    add(adminId, {
      type: "NEW_ENQUIRY",
      params: { name: "Ritu Mishra" },
      link: "/admin/enquiries",
      priority: "normal",
      minutesAgo: 180,
      readAt: now.getTime() - 170 * MINUTE,
    });
  }

  // Inventory alerts belong to whoever holds the INVENTORY permission.
  for (const adminId of ["user-owner", "user-manager"]) {
    add(adminId, {
      type: "INVENTORY_LOW",
      params: { item: "Paneer" },
      link: "/admin/inventory",
      priority: "normal",
      minutesAgo: 320,
      readAt: now.getTime() - 300 * MINUTE,
    });
  }

  return out.sort((a, b) => b.createdAt - a.createdAt);
}
