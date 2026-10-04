"use client";

import Link from "next/link";
import { BadgeCheck, Clock, CreditCard, TriangleAlert, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSettings } from "@/features/settings";
import { useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

/**
 * What the customer must do about the money, if anything.
 *
 * Each payment status gets its own card rather than one card with conditional
 * sentences, because the action attached to each is different: wait, pay
 * again, pay at the counter, or nothing at all.
 */
export function PaymentCard({ order }: { order: Order }) {
  const t = useT();
  const { data: settings } = useSettings(order.outletId);

  // A cancelled order is closed: never invite the customer to pay for it.
  const isCancelled = order.status === "CANCELLED";

  const methodLabel =
    order.paymentMethod === "CASH"
      ? t.track.methodCash
      : order.paymentMethod === "ONLINE_CARD"
        ? t.track.methodCard
        : t.track.methodUpi;

  const shell = (
    tone: "neutral" | "warning" | "danger" | "success",
    icon: React.ReactNode,
    title: string,
    body?: React.ReactNode,
    action?: React.ReactNode,
  ) => (
    <Card
      className={cn(
        "p-5",
        tone === "warning" && "border-warning/30 bg-warning/10",
        tone === "danger" && "border-danger/30 bg-danger/5",
        tone === "success" && "border-veg/25 bg-veg/5",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {body && <div className="mt-1 text-sm text-ink-muted">{body}</div>}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </Card>
  );

  if (order.paymentStatus === "PAID_UNVERIFIED") {
    return shell(
      "neutral",
      <Clock size={20} className="text-brand" aria-hidden="true" />,
      t.track.paidUnverified,
      order.paymentRef && (
        <span className="nums">{t.track.transactionRef(order.paymentRef)}</span>
      ),
    );
  }

  if (order.paymentStatus === "FAILED") {
    const rejected = [...order.paymentHistory]
      .reverse()
      .find((event) => event.action === "PAYMENT_REJECTED");
    const remaining = rejected
      ? Math.ceil(
          (rejected.at +
            (settings?.unpaidTakeawayTimeoutMinutes ?? 15) * 60_000 -
            Date.now()) /
            60_000,
        )
      : 0;
    // Only count down while there is still time, and never on a closed order.
    const minutesLeft = !isCancelled && remaining > 0 ? remaining : null;

    return shell(
      "danger",
      <TriangleAlert size={20} className="text-danger" aria-hidden="true" />,
      t.track.paymentFailed,
      <>
        {rejected?.reason && <p>{rejected.reason}</p>}
        {minutesLeft !== null && (
          <p className="nums mt-1 font-medium text-danger">
            {t.track.autoCancelIn(minutesLeft)}
          </p>
        )}
      </>,
      isCancelled ? undefined : (
        <Button asChild size="sm">
          <Link href={`/checkout/pay?orderId=${order.id}`}>{t.track.payAgain}</Link>
        </Button>
      ),
    );
  }

  if (order.paymentMethod === "CASH" && order.paymentStatus === "UNPAID") {
    return shell(
      "warning",
      <Wallet size={20} className="text-warning-dark" aria-hidden="true" />,
      t.track.cashAtCounter(formatPrice(order.total)),
      t.checkout.cashNote,
      isCancelled ? undefined : (
        <Button asChild size="sm" variant="outline">
          <Link href={`/checkout/pay?orderId=${order.id}`}>{t.track.payOnlineNow}</Link>
        </Button>
      ),
    );
  }

  if (order.paymentStatus === "REFUNDED") {
    return shell(
      "neutral",
      <CreditCard size={20} className="text-ink-muted" aria-hidden="true" />,
      t.track.refunded,
      <span className="nums">{formatPrice(order.total)}</span>,
    );
  }

  return shell(
    "success",
    <BadgeCheck size={20} className="text-veg-dark" aria-hidden="true" />,
    t.track.paidWith(methodLabel),
    <span className="nums">
      {formatPrice(order.total)}
      {order.changeReturned ? ` · ${formatPrice(order.changeReturned)} change` : ""}
    </span>,
  );
}
