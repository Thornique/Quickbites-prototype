"use client";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n";
import type { Order, OrderStatus, PaymentStatus } from "@/types";

type Tone = React.ComponentProps<typeof Badge>["variant"];

const STATUS_TONE: Record<OrderStatus, Tone> = {
  PLACED: "muted",
  ACCEPTED: "secondary",
  PREPARING: "warning",
  READY: "success",
  HANDED_OVER: "veg",
  CANCELLED: "danger",
};

/**
 * Order status, worded as the counter words it: HANDED_OVER is "Picked up" for
 * takeaway and "Served" for dine-in, which is why this needs the order rather
 * than just the status.
 */
export function StatusBadge({
  status,
  orderType,
  className,
}: {
  status: OrderStatus;
  orderType?: Order["orderType"];
  className?: string;
}) {
  const t = useT();

  const label =
    status === "HANDED_OVER"
      ? orderType === "DINE_IN"
        ? t.track.steps.handedOverDineIn
        : t.track.steps.handedOverTakeaway
      : status === "PLACED"
        ? t.track.steps.placed
        : status === "ACCEPTED"
          ? t.track.steps.accepted
          : status === "PREPARING"
            ? t.track.steps.preparing
            : status === "READY"
              ? t.track.steps.ready
              : t.track.steps.cancelled;

  return (
    <Badge variant={STATUS_TONE[status]} className={className}>
      {label}
    </Badge>
  );
}

const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  UNPAID: "warning",
  PAID_UNVERIFIED: "mustard",
  VERIFIED: "veg",
  FAILED: "danger",
  REFUNDED: "muted",
};

/**
 * Payment state, from the admin's point of view: what, if anything, they still
 * have to do about the money.
 */
export function PaymentBadge({
  order,
  className,
}: {
  order: Pick<Order, "paymentStatus" | "paymentMethod">;
  className?: string;
}) {
  const t = useT();

  const methodLabel =
    order.paymentMethod === "CASH"
      ? t.track.methodCash
      : order.paymentMethod === "ONLINE_CARD"
        ? t.track.methodCard
        : t.track.methodUpi;

  const label =
    order.paymentStatus === "VERIFIED"
      ? t.track.paidWith(methodLabel)
      : order.paymentStatus === "PAID_UNVERIFIED"
        ? t.adm.orders.payVerifying
        : order.paymentStatus === "FAILED"
          ? t.track.paymentFailed
          : order.paymentStatus === "REFUNDED"
            ? t.track.refunded
            : t.adm.orders.payCashPending;

  return (
    <Badge variant={PAYMENT_TONE[order.paymentStatus]} className={className}>
      {label}
    </Badge>
  );
}
