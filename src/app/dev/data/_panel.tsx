"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, RotateCcw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toErrorMessage } from "@/lib/errors";
import { formatNumber } from "@/lib/format";
import { flagsFor } from "@/services/orders";
import type { Order } from "@/types";
import {
  COLLECTIONS,
  ensureSeeded,
  STORAGE_BUDGET_BYTES,
  getStorageFootprint,
  getUploadedImageFootprint,
  readCollection,
  readSingleton,
  resetDemoData,
  subscribe,
  type CollectionName,
} from "@/storage";

/** Collections that hold a single object rather than an array. */
const SINGLETONS: CollectionName[] = ["siteContent", "storeSettings"];

interface Row {
  collection: CollectionName;
  count: number;
  bytes: number;
}

interface OrderBreakdown {
  byType: Record<string, number>;
  byPaymentStatus: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  scheduled: number;
  overdue: number;
  awaitingVerification: number;
  cashPending: number;
  blockedFromHandover: number;
}

interface Snapshot {
  rows: Row[];
  totalBytes: number;
  images: { count: number; bytes: number };
  orders: OrderBreakdown;
}

/** Order-flow counts, so the new rules can be checked at a glance. */
function breakdownOf(orders: Order[]): OrderBreakdown {
  const byType: Record<string, number> = {};
  const byPaymentStatus: Record<string, number> = {};
  const byPaymentMethod: Record<string, number> = {};
  let scheduled = 0;
  let overdue = 0;
  let awaitingVerification = 0;
  let cashPending = 0;
  let blockedFromHandover = 0;

  for (const order of orders) {
    byType[order.orderType] = (byType[order.orderType] ?? 0) + 1;
    byPaymentStatus[order.paymentStatus] =
      (byPaymentStatus[order.paymentStatus] ?? 0) + 1;
    byPaymentMethod[order.paymentMethod] =
      (byPaymentMethod[order.paymentMethod] ?? 0) + 1;
    if (order.isScheduled && order.status !== "CANCELLED") scheduled += 1;

    const flags = flagsFor(order);
    if (flags.isOverdue) overdue += 1;
    if (flags.awaitingVerification) awaitingVerification += 1;
    if (flags.cashPending) cashPending += 1;
    if (flags.blockedFromHandover) blockedFromHandover += 1;
  }

  return {
    byType,
    byPaymentStatus,
    byPaymentMethod,
    scheduled,
    overdue,
    awaitingVerification,
    cashPending,
    blockedFromHandover,
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function CountCard({
  title,
  counts,
}: {
  title: string;
  counts: Record<string, number>;
}) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
        {title}
      </p>
      <dl className="mt-2 grid gap-1">
        {entries.length === 0 && <dd className="text-sm text-ink-muted">None</dd>}
        {entries.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="truncate text-sm text-ink-muted">{label}</dt>
            <dd className="nums text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export function DevDataPanel() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const read = useCallback(async () => {
    const footprint = getStorageFootprint();
    const rows: Row[] = COLLECTIONS.map((collection) => ({
      collection,
      count: SINGLETONS.includes(collection)
        ? readSingleton(collection)
          ? 1
          : 0
        : readCollection(collection).length,
      bytes: footprint.perCollection[collection] ?? 0,
    }));
    const images = await getUploadedImageFootprint();
    setSnapshot({
      rows,
      totalBytes: footprint.bytes,
      images,
      orders: breakdownOf(readCollection<Order>("orders")),
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await ensureSeeded();
      if (!cancelled) await read();
    })();

    // Any write, in this tab or another, refreshes the counts.
    const unsubscribe = subscribe(() => void read());
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [read]);

  /*
    Development convenience: expose the service layer on window so flows can be
    exercised from the browser console without clicking through the whole app
    (`await __qb.auth.signIn("demo@quickbites.in", "Demo@123")`).
    This page is development-only, so nothing reaches a production build.
  */
  useEffect(() => {
    void import("@/services")
      .then((services) => {
        (window as unknown as Record<string, unknown>).__qb = services;
      })
      .catch((error) => {
        console.error("Could not attach the dev service handle:", error);
      });
    // Deliberately no teardown: StrictMode's double-invoke would remove the
    // handle straight after attaching it.
  }, []);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      await read();
      toast.success("Demo data reset", {
        description: "Every collection was rebuilt from the seed.",
      });
    } catch (error) {
      toast.error("Could not reset", { description: toErrorMessage(error) });
    } finally {
      setIsResetting(false);
    }
  };

  if (!snapshot) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const overBudget = snapshot.totalBytes > STORAGE_BUDGET_BYTES;
  const percentOfBudget = Math.round(
    (snapshot.totalBytes / STORAGE_BUDGET_BYTES) * 100,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            localStorage used
          </p>
          <p className="nums mt-1 text-2xl font-semibold text-ink">
            {formatBytes(snapshot.totalBytes)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {percentOfBudget}% of the {formatBytes(STORAGE_BUDGET_BYTES)} budget
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Records seeded
          </p>
          <p className="nums mt-1 text-2xl font-semibold text-ink">
            {formatNumber(snapshot.rows.reduce((sum, r) => sum + r.count, 0))}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            across {COLLECTIONS.length} collections
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Uploaded images (IndexedDB)
          </p>
          <p className="nums mt-1 text-2xl font-semibold text-ink">
            {snapshot.images.count}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {formatBytes(snapshot.images.bytes)} — seed photos are files, not uploads
          </p>
        </Card>
      </div>

      {overBudget && (
        <div className="flex items-start gap-3 rounded-card border border-warning/30 bg-warning/10 p-4">
          <TriangleAlert size={20} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-sm text-ink">
            The seeded data is over the {formatBytes(STORAGE_BUDGET_BYTES)} budget. Trim
            the generated order history before adding more collections.
          </p>
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold text-ink">Order flow</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CountCard title="By order type" counts={snapshot.orders.byType} />
          <CountCard
            title="By payment status"
            counts={snapshot.orders.byPaymentStatus}
          />
          <CountCard
            title="By payment method"
            counts={snapshot.orders.byPaymentMethod}
          />
          <CountCard
            title="Needs attention"
            counts={{
              Scheduled: snapshot.orders.scheduled,
              Overdue: snapshot.orders.overdue,
              "Awaiting verification": snapshot.orders.awaitingVerification,
              "Cash pending": snapshot.orders.cashPending,
              "Blocked handover": snapshot.orders.blockedFromHandover,
            }}
          />
        </div>
      </section>

      <Card flush>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection</TableHead>
              <TableHead className="text-right">Records</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="w-40">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshot.rows.map((row) => (
              <TableRow key={row.collection}>
                <TableCell className="font-medium">
                  {row.collection}
                  {row.count === 0 && (
                    <Badge variant="muted" className="ml-2">
                      empty
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="nums text-right">
                  {formatNumber(row.count)}
                </TableCell>
                <TableCell className="nums text-right">
                  {formatBytes(row.bytes)}
                </TableCell>
                <TableCell>
                  <div
                    className="h-2 rounded-pill bg-sand-100"
                    role="img"
                    aria-label={`${Math.round((row.bytes / Math.max(1, snapshot.totalBytes)) * 100)}% of stored data`}
                  >
                    <div
                      className="h-full rounded-pill bg-brand"
                      style={{
                        width: `${Math.max(
                          row.bytes > 0 ? 2 : 0,
                          (row.bytes / Math.max(1, snapshot.totalBytes)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex flex-wrap items-center gap-3 rounded-card border border-hairline bg-surface p-5">
        <Database size={20} className="text-ink-muted" aria-hidden="true" />
        <p className="flex-1 text-sm text-ink-muted">
          Resetting wipes every collection and rebuilds the demo dataset. Open a second
          tab to confirm it updates there too.
        </p>
        <Button variant="outline" onClick={handleReset} disabled={isResetting}>
          <RotateCcw aria-hidden="true" />
          {isResetting ? "Resetting…" : "Reset demo data"}
        </Button>
      </div>
    </div>
  );
}
