"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toErrorMessage } from "@/lib/errors";
import { formatPrice, formatTime } from "@/lib/format";
import { getSession, signInAsAdmin } from "@/services/auth";
import {
  accept,
  advanceOrder,
  extendReadyTime,
  flagsFor,
  handOver,
  listOrders,
  recordCashPayment,
  rejectPayment,
  verifyPayment,
} from "@/services/orders";
import { subscribe } from "@/storage";
import type { Order } from "@/types";

/**
 * Demo controls — development only.
 *
 * Stands in for the admin order board (step 10) so a customer's tracking page
 * can be driven from a second tab. Every button calls the real service through
 * the admin session, so the customer sees the genuine flow rather than a
 * simulation — and because that session is separate from the site's, the
 * customer stays signed in in the other tab.
 */
export function DemoControls() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [readyMinutes, setReadyMinutes] = useState(15);
  const [cashAmount, setCashAmount] = useState(500);
  const [isBusy, setIsBusy] = useState(false);

  const load = useCallback(async () => {
    const open = await listOrders({ status: "ACTIVE" });
    setOrders(open);
    setSelectedId((current) =>
      current && open.some((o) => o.id === current) ? current : (open[0]?.id ?? null),
    );
  }, []);

  useEffect(() => {
    void load();
    return subscribe(() => void load(), ["orders"]);
  }, [load]);

  const order = orders.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    if (order?.paymentMethod === "CASH") setCashAmount(order.total);
  }, [order?.id, order?.paymentMethod, order?.total]);

  /** Signs the manager in to the admin session once, then runs the action. */
  const run = async (label: string, action: () => Promise<unknown>) => {
    setIsBusy(true);
    try {
      if (!(await getSession("admin"))) {
        await signInAsAdmin("manager@quickbites.in", "Manager@123");
      }
      await action();
      toast.success(label);
      await load();
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsBusy(false);
    }
  };

  const flags = order ? flagsFor(order) : null;

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">Demo controls</h2>
      <p className="mt-1 text-xs text-ink-muted">
        Signs the manager into the admin session and runs the real order services.
        Open an order&apos;s tracking page in another tab and watch it react.
        Replaced by the admin board in step 10.
      </p>

      <div className="mt-4 grid gap-1.5">
        <Label htmlFor="demo-order">Open order</Label>
        <select
          id="demo-order"
          value={selectedId ?? ""}
          onChange={(event) => setSelectedId(event.target.value)}
          className="h-10 w-full rounded-control border border-hairline bg-surface px-3 text-sm text-ink"
        >
          {orders.length === 0 && <option value="">No open orders</option>}
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.tokenNumber} · {o.id} · {o.orderType} · {o.status} · {o.paymentStatus}
            </option>
          ))}
        </select>
      </div>

      {order && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="muted">{order.status}</Badge>
            <Badge variant={order.paymentStatus === "VERIFIED" ? "veg" : "warning"}>
              {order.paymentStatus} · {order.paymentMethod}
            </Badge>
            <Badge variant="secondary">{formatPrice(order.total)}</Badge>
            {order.estimatedReadyAt && (
              <Badge variant="muted">ready {formatTime(order.estimatedReadyAt)}</Badge>
            )}
            {flags?.isOverdue && <Badge variant="danger">overdue</Badge>}
            <a
              href={`/order/${order.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
            >
              Open tracking in a new tab
            </a>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="demo-minutes">Ready in (minutes)</Label>
              <Input
                id="demo-minutes"
                type="number"
                min={1}
                max={90}
                value={readyMinutes}
                onChange={(event) => setReadyMinutes(Number(event.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="demo-cash">Cash received (₹)</Label>
              <Input
                id="demo-cash"
                type="number"
                min={0}
                value={cashAmount}
                onChange={(event) => setCashAmount(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={isBusy}
              onClick={() => void run("Payment verified", () => verifyPayment(order.id))}
            >
              Verify payment
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isBusy}
              onClick={() =>
                void run("Payment rejected", () =>
                  rejectPayment(order.id, "No matching transaction found."),
                )
              }
            >
              Reject payment
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => void run("Accepted", () => accept(order.id, readyMinutes))}
            >
              Accept ({readyMinutes} min)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() =>
                void run("Ready time extended", () =>
                  extendReadyTime(order.id, 5, "Kitchen running behind"),
                )
              }
            >
              Extend +5
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => void run("Preparing", () => advanceOrder(order.id, "PREPARING"))}
            >
              Mark preparing
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => void run("Ready", () => advanceOrder(order.id, "READY"))}
            >
              Mark ready
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() =>
                void run("Cash recorded", () => recordCashPayment(order.id, cashAmount))
              }
            >
              Record cash
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => void run("Handed over", () => handOver(order.id))}
            >
              Hand over
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
