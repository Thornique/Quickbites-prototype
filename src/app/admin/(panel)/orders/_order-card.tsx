"use client";

import { AlarmClock, Clock, Hourglass, StickyNote } from "lucide-react";
import { PaymentBadge } from "@/components/admin/badges";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { VegMark } from "@/components/ui/veg-mark";
import { OutletBadge } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { formatPrice, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { flagsFor } from "@/services/orders";
import type { Order } from "@/types";
import { OrderActions } from "./_order-actions";

/**
 * One order on the board.
 *
 * Written to be read at arm's length by somebody holding a spatula: the token
 * is the biggest thing on it, the items are at body size rather than caption
 * size, and anything wrong — overdue, waiting too long, due to start — colours
 * the whole card rather than hiding in a corner.
 */
export function OrderCard({
  order,
  now,
  onOpenDetail,
}: {
  order: Order;
  /** Shared clock, so a column of cards does not keep its own timers. */
  now: number;
  onOpenDetail: (order: Order) => void;
}) {
  const t = useT();
  const pick = usePick();
  const flags = flagsFor(order, new Date(now));

  const placedMinutes = Math.floor((now - Date.parse(order.createdAt)) / 60000);
  const readyAt = order.estimatedReadyAt ? Date.parse(order.estimatedReadyAt) : null;
  const minutesLeft = readyAt === null ? null : Math.ceil((readyAt - now) / 60000);

  const isAlarmed = flags.isOverdue || flags.isStalePending || flags.isDueToStart;

  return (
    <Card
      className={cn(
        "p-3",
        flags.isOverdue && "border-danger/40 bg-danger/5",
        !flags.isOverdue && flags.isStalePending && "border-warning/40 bg-warning/5",
        !flags.isOverdue &&
          !flags.isStalePending &&
          flags.isDueToStart &&
          "border-brand/40 bg-brand/5",
      )}
    >
      {/* Token and money. */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="nums text-display text-3xl leading-none text-ink">
            {order.tokenNumber}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink-muted">
            {order.orderType === "TAKEAWAY"
              ? t.orderType.takeaway
              : order.tableNumber
                ? `${t.orderType.dineIn} · ${t.adm.orders.table(order.tableNumber)}`
                : t.orderType.dineIn}
          </p>
          <p className="nums mt-0.5 text-xs text-ink-muted">{order.id}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="nums text-base font-bold text-ink">
            {formatPrice(order.total)}
          </p>
          <p className="nums mt-0.5 text-xs text-ink-muted">
            {t.adm.orders.itemCount(order.itemCount)}
          </p>
        </div>
      </div>

      {/* Payment and timing. */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {/*
          Which counter it belongs to. On the super admin's combined board
          two A-series and C-series tokens sit side by side, and the badge is
          what stops a coffee being carried to the kitchen.
        */}
        <OutletBadge outletId={order.outletId} />
        <PaymentBadge order={order} />

        {order.status === "PLACED" && (
          <Badge variant={flags.isStalePending ? "warning" : "muted"}>
            <Clock aria-hidden="true" />
            {flags.isStalePending
              ? t.adm.orders.waitingTooLong
              : t.adm.orders.placedAgo(placedMinutes)}
          </Badge>
        )}

        {flags.isOverdue && minutesLeft !== null && (
          <Badge variant="danger">
            <AlarmClock aria-hidden="true" />
            {t.adm.orders.overdueBy(Math.abs(minutesLeft))}
          </Badge>
        )}

        {!flags.isOverdue && readyAt !== null && order.status !== "HANDED_OVER" && (
          <Badge variant="secondary">
            <Hourglass aria-hidden="true" />
            {minutesLeft !== null && minutesLeft > 0
              ? t.adm.orders.minutesLeft(minutesLeft)
              : t.adm.orders.readyBy(formatTime(order.estimatedReadyAt!))}
          </Badge>
        )}

        {flags.isDueToStart && (
          <Badge variant="default">{t.adm.orders.dueToStart}</Badge>
        )}

        {order.isScheduled && order.scheduledFor && !flags.isDueToStart && (
          <Badge variant="muted">
            {t.adm.orders.scheduledFor(formatTime(order.scheduledFor))}
          </Badge>
        )}
      </div>

      {/* The food. Body size, not caption size — this is what gets cooked. */}
      <ul className="mt-3 grid gap-1.5 border-t border-hairline pt-2.5">
        {order.lines.map((line, index) => (
          <li key={`${line.menuItemId}-${index}`} className="flex gap-2 text-sm">
            <span className="nums w-6 shrink-0 font-bold text-ink">
              {line.quantity}×
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start gap-1.5">
                <VegMark isVeg={line.isVeg} size="sm" className="mt-0.5 shrink-0" />
                <span className="font-medium text-ink">{pick(line.name)}</span>
              </span>
              {line.options.length > 0 && (
                <span className="mt-0.5 block text-xs text-ink-muted">
                  {line.options.map((option) => pick(option.name)).join(", ")}
                </span>
              )}
              {line.notes && (
                <span className="mt-0.5 flex items-start gap-1 text-xs font-medium text-warning-dark">
                  <StickyNote
                    size={12}
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  {line.notes}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {/* A note for the whole order, which the kitchen must not miss. */}
      {order.notes && (
        <p className="mt-2 rounded-control border border-warning/30 bg-warning/10 px-2.5 py-1.5 text-xs font-medium text-ink">
          {t.adm.orders.note(order.notes)}
        </p>
      )}

      <div className="mt-3">
        <OrderActions order={order} onOpenDetail={onOpenDetail} />
      </div>

      {isAlarmed && <span className="sr-only">{t.adm.dashboard.overdue}</span>}
    </Card>
  );
}
