import {
  AlarmClock,
  BadgeIndianRupee,
  Ban,
  CalendarCheck,
  ChefHat,
  CircleCheck,
  Clock,
  MessageSquare,
  PackageCheck,
  ShoppingBag,
  Star,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import type { NotificationType } from "@/types";

/** One icon per notification type, so the list scans without reading. */
const ICONS: Record<NotificationType, typeof Clock> = {
  ORDER_CONFIRMED: CircleCheck,
  PAYMENT_REJECTED: TriangleAlert,
  READY_TIME_EXTENDED: AlarmClock,
  ORDER_PREPARING: ChefHat,
  ORDER_READY: PackageCheck,
  ORDER_HANDED_OVER: Star,
  ORDER_CANCELLED: Ban,
  SCHEDULED_REMINDER: Clock,
  BOOKING_CONFIRMED: CalendarCheck,
  BOOKING_CANCELLED: Ban,
  REVIEW_REPLIED: MessageSquare,

  NEW_ORDER: ShoppingBag,
  PAYMENT_AWAITING: BadgeIndianRupee,
  PAYMENT_STALE: TriangleAlert,
  CASH_TO_COLLECT: Wallet,
  SWITCHED_TO_ONLINE: BadgeIndianRupee,
  SCHEDULED_DUE: AlarmClock,
  ORDER_OVERDUE: TriangleAlert,
  TAKEAWAY_AUTO_CANCELLED: Ban,
  INVENTORY_LOW: TriangleAlert,
  INVENTORY_OUT: TriangleAlert,
  NEW_BOOKING: CalendarCheck,
  NEW_ENQUIRY: MessageSquare,
  NEW_REVIEW: Star,
};

/** Tint by meaning, not by priority — red is reserved for real problems. */
const TONES: Partial<Record<NotificationType, string>> = {
  PAYMENT_REJECTED: "bg-danger/10 text-danger",
  PAYMENT_STALE: "bg-danger/10 text-danger",
  ORDER_OVERDUE: "bg-danger/10 text-danger",
  ORDER_CANCELLED: "bg-danger/10 text-danger",
  BOOKING_CANCELLED: "bg-danger/10 text-danger",
  TAKEAWAY_AUTO_CANCELLED: "bg-danger/10 text-danger",
  INVENTORY_OUT: "bg-danger/10 text-danger",
  INVENTORY_LOW: "bg-warning/12 text-warning-dark",
  READY_TIME_EXTENDED: "bg-warning/12 text-warning-dark",
  ORDER_READY: "bg-veg/10 text-veg-dark",
  ORDER_CONFIRMED: "bg-veg/10 text-veg-dark",
  BOOKING_CONFIRMED: "bg-veg/10 text-veg-dark",
};

export function notificationIcon(type: NotificationType) {
  return ICONS[type] ?? Clock;
}

export function notificationTone(type: NotificationType): string {
  return TONES[type] ?? "bg-sand-100 text-ink-muted";
}
