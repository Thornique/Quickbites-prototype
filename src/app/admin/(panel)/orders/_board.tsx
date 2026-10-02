"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/features/orders";
import { useT } from "@/i18n";
import { toDateKey } from "@/lib/format";
import { flagsFor } from "@/services/orders";
import type { Order, OrderStatus } from "@/types";
import { OrderCard } from "./_order-card";
import { useOrderClock } from "./_use-order-clock";

/**
 * The kitchen board.
 *
 * Five columns in the order work flows, scrolling sideways as a whole on a
 * narrow screen rather than stacking — the shape of the board is how the
 * counter knows where a token is without reading labels.
 *
 * Scheduled orders are deliberately kept off the board until they are due to
 * start; otherwise tomorrow's eleven o'clock booking sits in "Needs
 * verification" all evening getting in the way.
 */
export function OrdersBoard({ onOpenDetail }: { onOpenDetail: (order: Order) => void }) {
  const t = useT();
  const now = useOrderClock();
  const { data: orders, isLoading } = useOrders({ status: "ALL" });

  const columns = useMemo(() => {
    const today = toDateKey(new Date(now));
    const buckets: Record<OrderStatus, Order[]> = {
      PLACED: [],
      ACCEPTED: [],
      PREPARING: [],
      READY: [],
      HANDED_OVER: [],
      CANCELLED: [],
    };

    for (const order of orders ?? []) {
      if (order.status === "CANCELLED") continue;

      // Handed over is a record of today's work, not a queue.
      if (order.status === "HANDED_OVER") {
        if (toDateKey(order.createdAt) === today) buckets.HANDED_OVER.push(order);
        continue;
      }

      // A future scheduled order lives on the Scheduled tab until it is due.
      if (order.isScheduled && order.status === "PLACED") {
        const flags = flagsFor(order, new Date(now));
        if (!flags.isDueToStart) continue;
      }

      buckets[order.status].push(order);
    }

    // Oldest first in the working columns — first in, first cooked.
    for (const status of ["PLACED", "ACCEPTED", "PREPARING", "READY"] as const) {
      buckets[status].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    }
    buckets.HANDED_OVER.sort((a, b) => Date.parse(b.updatedAt ?? b.createdAt) - Date.parse(a.updatedAt ?? a.createdAt));

    return [
      { key: "PLACED" as const, label: t.adm.orders.columns.verify, rows: buckets.PLACED },
      {
        key: "ACCEPTED" as const,
        label: t.adm.orders.columns.accepted,
        rows: buckets.ACCEPTED,
      },
      {
        key: "PREPARING" as const,
        label: t.adm.orders.columns.preparing,
        rows: buckets.PREPARING,
      },
      { key: "READY" as const, label: t.adm.orders.columns.ready, rows: buckets.READY },
      {
        key: "HANDED_OVER" as const,
        label: t.adm.orders.columns.handedOver,
        rows: buckets.HANDED_OVER,
      },
    ];
  }, [orders, now, t]);

  if (isLoading) {
    return (
      <div className="grid gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-card" />
        ))}
      </div>
    );
  }

  /*
    Five columns side by side from lg, and stacked below it.

    An earlier version scrolled the whole board sideways on a phone, which both
    made the page itself scroll horizontally and meant hunting for a token with
    one thumb. Stacked sections with their counts read better at the counter.
  */
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {columns.map((column) => (
          <section
            key={column.key}
            aria-label={column.label}
            className="flex min-w-0 flex-col"
          >
            {/*
              Sticky only from lg: below that the board is one horizontal
              scroller, and a sticky child inside it makes the whole page
              scroll sideways rather than just the board.
            */}
            <div className="flex items-center justify-between gap-2 rounded-control bg-sand-100 px-3 py-2 lg:sticky lg:top-14 lg:z-10">
              <h2 className="text-xs font-bold tracking-wide text-ink uppercase">
                {column.label}
              </h2>
              <Badge variant={column.rows.length > 0 ? "default" : "muted"}>
                {column.rows.length}
              </Badge>
            </div>

            <div className="mt-2 grid gap-2">
              {column.rows.length === 0 ? (
                <p className="rounded-card border border-dashed border-hairline px-3 py-6 text-center text-xs text-ink-muted">
                  {t.adm.orders.emptyColumn}
                </p>
              ) : (
                column.rows.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    onOpenDetail={onOpenDetail}
                  />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
