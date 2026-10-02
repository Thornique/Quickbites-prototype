"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireAdmin } from "@/features/auth";
import { useOperationalCounts } from "@/features/orders";
import { useT } from "@/i18n";
import type { Order } from "@/types";
import { OrdersBoard } from "./_board";
import { OrderDetailSheet } from "./_order-detail";
import { OrdersTable } from "./_orders-table";
import { ScheduledOrders } from "./_scheduled";

type View = "board" | "table" | "scheduled";

function OrdersWorkspace() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: counts } = useOperationalCounts();

  const view = (searchParams.get("view") as View) ?? "board";
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const openDetail = (order: Order) => {
    setDetailOrder(order);
    setIsDetailOpen(true);
  };

  // The view lives in the URL so the dashboard can link straight to Scheduled.
  const setView = (next: string) => {
    router.replace(next === "board" ? "/admin/orders" : `/admin/orders?view=${next}`, {
      scroll: false,
    });
  };

  return (
    <>
      <PageHeader title={t.adm.orders.title} description={t.adm.orders.subtitle}>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="board">
              {t.adm.orders.boardView}
              {(counts?.active ?? 0) > 0 && (
                <Badge variant="muted" className="ml-1.5">
                  {counts?.active}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              {t.adm.orders.scheduledView}
              {(counts?.scheduledToday ?? 0) > 0 && (
                <Badge variant="muted" className="ml-1.5">
                  {counts?.scheduledToday}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="table">{t.adm.orders.tableView}</TabsTrigger>
          </TabsList>

          {/*
            Rendered outside TabsContent: the board is wide and the table owns
            its own filters, and mounting all three at once would run three sets
            of queries on every order write.
          */}
        </Tabs>
      </PageHeader>

      {view === "board" && <OrdersBoard onOpenDetail={openDetail} />}
      {view === "scheduled" && <ScheduledOrders onOpenDetail={openDetail} />}
      {view === "table" && <OrdersTable onOpenDetail={openDetail} />}

      <OrderDetailSheet
        order={detailOrder}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
}

export default function AdminOrdersPage() {
  return (
    <RequireAdmin permission="ORDERS">
      {/* useSearchParams needs a boundary even inside a client page. */}
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-card" />}>
        <OrdersWorkspace />
      </Suspense>
    </RequireAdmin>
  );
}
