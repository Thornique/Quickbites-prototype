import type { NotificationParams, NotificationType } from "@/types";

export interface NotificationCopy {
  title: string;
  body: string;
}

export type NotificationDictionary = Record<
  NotificationType,
  (params: NotificationParams) => NotificationCopy
>;

const token = (p: NotificationParams) => p.token ?? p.orderId ?? "";

/**
 * English notification copy. Each entry is a function of the stored params,
 * which is why the rows themselves hold no text.
 */
export const enNotify: NotificationDictionary = {
  /* ---- Customer ------------------------------------------------------ */
  ORDER_CONFIRMED: (p) => ({
    title: `Order ${token(p)} confirmed`,
    body: p.time
      ? `We've started cooking. Ready by about ${p.time}.`
      : "We've started cooking.",
  }),
  PAYMENT_REJECTED: (p) => ({
    title: `Payment not confirmed for ${token(p)}`,
    body: p.minutes
      ? `We couldn't find your payment. Please pay again within ${p.minutes} min or the order will be cancelled.`
      : "We couldn't find your payment. Please pay again.",
  }),
  READY_TIME_EXTENDED: (p) => ({
    title: `Order ${token(p)} will take a little longer`,
    body: p.time
      ? `Sorry — now ready by about ${p.time}.`
      : `Sorry — about ${p.minutes ?? 10} more minutes.`,
  }),
  ORDER_PREPARING: (p) => ({
    title: `Order ${token(p)} is being made`,
    body: "Your food is on the pass now.",
  }),
  ORDER_READY: (p) => ({
    title: `Order ${token(p)} is ready`,
    body: `Show token ${token(p)} at the counter.`,
  }),
  ORDER_HANDED_OVER: (p) => ({
    title: `Enjoy your food`,
    body: `How was order ${token(p)}? Tap to leave a rating.`,
  }),
  ORDER_CANCELLED: (p) => ({
    title: `Order ${token(p)} was cancelled`,
    body: p.reason
      ? `${p.reason} Any payment has been refunded.`
      : "Any payment has been refunded.",
  }),
  SCHEDULED_REMINDER: (p) => ({
    title: `Pickup in 30 minutes`,
    body: p.time
      ? `Order ${token(p)} is scheduled for ${p.time}.`
      : `Order ${token(p)} is due soon.`,
  }),
  BOOKING_CONFIRMED: (p) => ({
    title: "Table confirmed",
    body: p.time ? `We'll see you at ${p.time}.` : "We'll see you soon.",
  }),
  BOOKING_CANCELLED: () => ({
    title: "Table booking cancelled",
    body: "Your booking has been cancelled. Please call us to rebook.",
  }),
  REVIEW_REPLIED: () => ({
    title: "Quick Bites replied to your review",
    body: "Tap to read what the cafe said.",
  }),

  /* ---- Admin --------------------------------------------------------- */
  NEW_ORDER: (p) => ({
    title: `New order ${token(p)}`,
    body: p.amount ? `₹${p.amount} · tap to open the board.` : "Tap to open the board.",
  }),
  PAYMENT_AWAITING: (p) => ({
    title: `Payment to verify — ${token(p)}`,
    body: p.amount
      ? `₹${p.amount} paid online. Confirm it landed.`
      : "Confirm the payment landed.",
  }),
  PAYMENT_STALE: (p) => ({
    title: `${token(p)} still unverified`,
    body: `Waiting ${p.minutes ?? 5}+ minutes. The customer is watching.`,
  }),
  CASH_TO_COLLECT: (p) => ({
    title: `Cash to collect — ${token(p)}`,
    body: p.amount ? `₹${p.amount} due at the counter.` : "Payment due at the counter.",
  }),
  SWITCHED_TO_ONLINE: (p) => ({
    title: `${token(p)} switched to online payment`,
    body: "Verify the payment when it lands.",
  }),
  SCHEDULED_DUE: (p) => ({
    title: `Start scheduled order ${token(p)}`,
    body: p.time ? `Due for pickup at ${p.time}.` : "Due for pickup soon.",
  }),
  ORDER_OVERDUE: (p) => ({
    title: `${token(p)} is overdue`,
    body: "Past the promised time. Mark it ready or add minutes.",
  }),
  TAKEAWAY_AUTO_CANCELLED: (p) => ({
    title: `${token(p)} auto-cancelled`,
    body: "The customer did not pay again in time.",
  }),
  INVENTORY_LOW: (p) => ({
    title: "Stock running low",
    body: `${p.item ?? "An item"} is below its threshold.`,
  }),
  INVENTORY_OUT: (p) => ({
    title: "Out of stock",
    body: `${p.item ?? "An item"} has run out. Linked menu items are now sold out.`,
  }),
  NEW_BOOKING: (p) => ({
    title: "New table booking",
    body: p.name ? `${p.name} requested a table.` : "A new table request came in.",
  }),
  NEW_ENQUIRY: (p) => ({
    title: "New enquiry",
    body: p.name ? `${p.name} sent a message.` : "A new message came in.",
  }),
  NEW_REVIEW: (p) => ({
    title: "New review",
    body: p.rating
      ? `${p.rating}-star review awaiting approval.`
      : "A review is awaiting approval.",
  }),
};
