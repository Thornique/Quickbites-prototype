"use client";

import { useState } from "react";
import Link from "next/link";
import { Receipt, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyOrders } from "@/features/orders";
import { OutletBadge, useOutlet } from "@/features/outlet";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { buildReorderLines, isActiveStatus } from "@/services/orders";
import { useCartStore } from "@/store/cart";
import type { Order } from "@/types";
import { RateOrderDialog } from "./_rate-order-dialog";

export default function AccountOrdersPage() {
  const t = useT();
  const { data: orders, isLoading } = useMyOrders();
  const { outletId, setOutlet } = useOutlet();
  const addLine = useCartStore((s) => s.addLine);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);

  const active = (orders ?? []).filter((order) => isActiveStatus(order.status));
  const past = (orders ?? []).filter((order) => !isActiveStatus(order.status));

  const handleReorder = async (order: Order) => {
    try {
      const { lines, skipped } = await buildReorderLines(order.id);
      /*
        Reordering has to land in the right basket. Switching first means the
        coffee lines go into the coffee cart even if the restaurant is on
        screen — and the customer ends up looking at the menu they reordered
        from, which is where they would want to be anyway.
      */
      if (order.outletId !== outletId) setOutlet(order.outletId);
      lines.forEach(addLine);
      if (lines.length > 0) toast.success(t.orders.reordered(lines.length));
      if (skipped.length > 0)
        toast.warning(t.orders.reorderSkipped(skipped.join(", ")));
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    }
  };

  const statusBadge = (order: Order) => {
    if (order.status === "CANCELLED")
      return <Badge variant="danger">{t.track.steps.cancelled}</Badge>;
    if (order.status === "HANDED_OVER")
      return (
        <Badge variant="success">
          {order.orderType === "TAKEAWAY"
            ? t.track.steps.handedOverTakeaway
            : t.track.steps.handedOverDineIn}
        </Badge>
      );
    if (order.status === "READY")
      return <Badge variant="success">{t.track.steps.ready}</Badge>;
    if (order.status === "PREPARING")
      return <Badge variant="warning">{t.track.steps.preparing}</Badge>;
    if (order.status === "ACCEPTED")
      return <Badge variant="secondary">{t.track.steps.accepted}</Badge>;
    return <Badge variant="muted">{t.track.steps.placed}</Badge>;
  };

  const paymentBadge = (order: Order) => {
    switch (order.paymentStatus) {
      case "VERIFIED":
        return <Badge variant="veg">{t.track.paidWith("")}</Badge>;
      case "PAID_UNVERIFIED":
        return <Badge variant="muted">{t.track.steps.paymentVerified}…</Badge>;
      case "FAILED":
        return <Badge variant="danger">{t.track.paymentFailed}</Badge>;
      case "REFUNDED":
        return <Badge variant="muted">{t.track.refunded}</Badge>;
      default:
        return <Badge variant="warning">{t.checkout.payCash}</Badge>;
    }
  };

  const renderList = (rows: Order[], emptyTitle: string, emptyBody: string) => {
    if (isLoading) {
      return (
        <div className="mt-4 grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-card" />
          ))}
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <EmptyState
          className="mt-4"
          icon={Receipt}
          title={emptyTitle}
          description={emptyBody}
          action={
            <Button asChild variant="outline">
              <Link href="/menu">{t.cartPage.browseMenu}</Link>
            </Button>
          }
        />
      );
    }

    return (
      <ul className="mt-4 grid gap-3">
        {rows.map((order) => (
          <li key={order.id}>
            <Card className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="nums text-display text-xl text-brand">
                    {order.tokenNumber}
                  </p>
                  <p className="nums mt-0.5 text-xs text-ink-muted">
                    {order.id} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Which counter it came from — two outlets, one history. */}
                  <OutletBadge outletId={order.outletId} />
                  {statusBadge(order)}
                  {paymentBadge(order)}
                </div>
              </div>

              <p className="mt-2 truncate text-sm text-ink-muted">
                {order.lines
                  .map((line) => `${line.quantity} × ${line.name.en}`)
                  .join(", ")}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
                <Price value={order.total} size="lg" />
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/order/${order.id}`}>{t.orders.track}</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void handleReorder(order)}
                  >
                    {t.orders.reorder}
                  </Button>
                  {order.status === "HANDED_OVER" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRatingOrder(order)}
                    >
                      <Star aria-hidden="true" />
                      {t.orders.rate}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
        {t.orders.title}
      </h1>

      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active">
            {t.orders.active}
            {active.length > 0 && <span className="nums ml-1.5">{active.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="past">{t.orders.past}</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {renderList(active, t.orders.noneActive, t.orders.noneActiveBody)}
        </TabsContent>
        <TabsContent value="past">
          {renderList(past, t.orders.nonePast, t.orders.nonePastBody)}
        </TabsContent>
      </Tabs>

      <RateOrderDialog order={ratingOrder} onClose={() => setRatingOrder(null)} />
    </div>
  );
}
