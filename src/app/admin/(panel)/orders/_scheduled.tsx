"use client";

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/features/orders";
import { useAdminOutlet } from "@/features/outlet";
import { useT } from "@/i18n";
import { formatDate } from "@/lib/format";
import type { Order } from "@/types";
import { OrderCard } from "./_order-card";
import { useOrderClock } from "./_use-order-clock";

/**
 * Scheduled takeaway, grouped by the day it is due.
 *
 * These are off the board on purpose until they are due to start — see
 * _board.tsx — so this tab is where the cafe looks ahead. The cards are the same
 * ones, which means an order can be accepted from here as soon as its payment is
 * verified, without waiting for it to appear on the board.
 */
export function ScheduledOrders({
  onOpenDetail,
}: {
  onOpenDetail: (order: Order) => void;
}) {
  const t = useT();
  const now = useOrderClock();
  const { outletId } = useAdminOutlet();
  const { data: orders, isLoading } = useOrders({
    status: "ALL",
    outletId,
    scheduledOnly: true,
  });

  const days = useMemo(() => {
    const open = (orders ?? []).filter(
      (order) =>
        order.status !== "CANCELLED" &&
        order.status !== "HANDED_OVER" &&
        order.scheduledFor,
    );

    const grouped = new Map<string, Order[]>();
    for (const order of open.sort(
      (a, b) => Date.parse(a.scheduledFor!) - Date.parse(b.scheduledFor!),
    )) {
      const key = formatDate(order.scheduledFor!);
      grouped.set(key, [...(grouped.get(key) ?? []), order]);
    }
    return [...grouped.entries()];
  }, [orders]);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-60 w-full rounded-card" />
        ))}
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title={t.adm.orders.noScheduled}
        description={t.adm.orders.noScheduledBody}
      />
    );
  }

  return (
    <div className="grid gap-6">
      {days.map(([day, rows]) => (
        <section key={day}>
          <h2 className="nums text-xs font-bold tracking-wide text-ink-muted uppercase">
            {day}
          </h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                now={now}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
