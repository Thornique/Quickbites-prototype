import type { EpochMs } from "./order";
import type { OutletId } from "./outlet";

/**
 * Notification types. Each one maps to a title/body pair in the i18n
 * dictionaries — the text itself is never stored, so a notification created
 * in English reads correctly after the customer switches to Hindi, and 50
 * stored rows cost kilobytes rather than tens of them.
 */
export const CUSTOMER_NOTIFICATION_TYPES = [
  "ORDER_CONFIRMED",
  "PAYMENT_REJECTED",
  "READY_TIME_EXTENDED",
  "ORDER_PREPARING",
  "ORDER_READY",
  "ORDER_HANDED_OVER",
  "ORDER_CANCELLED",
  "SCHEDULED_REMINDER",
  "BOOKING_CONFIRMED",
  "BOOKING_CANCELLED",
  "REVIEW_REPLIED",
] as const;

export const ADMIN_NOTIFICATION_TYPES = [
  "NEW_ORDER",
  "PAYMENT_AWAITING",
  "PAYMENT_STALE",
  "CASH_TO_COLLECT",
  "SWITCHED_TO_ONLINE",
  "SCHEDULED_DUE",
  "ORDER_OVERDUE",
  "TAKEAWAY_AUTO_CANCELLED",
  "INVENTORY_LOW",
  "INVENTORY_OUT",
  "NEW_BOOKING",
  "NEW_ENQUIRY",
  "NEW_REVIEW",
] as const;

export const NOTIFICATION_TYPES = [
  ...CUSTOMER_NOTIFICATION_TYPES,
  ...ADMIN_NOTIFICATION_TYPES,
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Everything a notification's text might need to interpolate. */
export interface NotificationParams {
  orderId?: string;
  /** Counter token, e.g. "A23" — what the customer is actually called by. */
  token?: string;
  minutes?: number;
  amount?: number;
  /** Clock time such as "7:42 PM", pre-formatted at creation. */
  time?: string;
  name?: string;
  item?: string;
  reason?: string;
  rating?: number;
}

export type NotificationPriority = "normal" | "high";

export interface AppNotification {
  id: string;
  /** Fanned out per user at creation, so read state is per person. */
  recipientUserId: string;
  /** The outlet the alert is about; unset on account-wide messages. */
  outletId?: OutletId;
  type: NotificationType;
  params: NotificationParams;
  /** Where clicking it should go. */
  link?: string;
  priority: NotificationPriority;
  readAt?: EpochMs;
  createdAt: EpochMs;
  /**
   * Set on alerts that must fire exactly once (an order going overdue, a
   * scheduled order coming due). Repeated notify() calls with the same key
   * for the same user are ignored.
   */
  dedupeKey?: string;
}

/** Per-user delivery preferences, kept outside the versioned collections. */
export interface NotificationPreferences {
  soundEnabled: boolean;
  browserEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  soundEnabled: true,
  browserEnabled: false,
};
