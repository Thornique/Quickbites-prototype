"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Phone, Printer, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { VegMark } from "@/components/ui/veg-mark";
import { useOrder } from "@/features/orders";
import { usePick, useT } from "@/i18n";
import { STORE } from "@/lib/constants";
import { toErrorMessage } from "@/lib/errors";
import { formatDateTime, formatPrice, formatTime, minutesUntil } from "@/lib/format";
import { cancelOrder, flagsFor } from "@/services/orders";
import { scheduledStartAt } from "@/services/order-rules";
import { useSettings } from "@/features/settings";
import { PaymentCard } from "./_payment-card";
import { StatusTimeline } from "./_status-timeline";

/**
 * Live order tracking.
 *
 * The data comes from useOrder, which re-reads on every cross-tab sync event,
 * so an admin accepting or extending in another tab lands here without a
 * refresh. The clock ticks separately so the countdown keeps moving even when
 * nothing has changed.
 */
export function OrderTracking({ id }: { id: string }) {
  const t = useT();
  const pick = usePick();
  const { data: order, isLoading, error } = useOrder(id);
  const { data: settings } = useSettings();
  const [, setTick] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  // Keep the countdown honest without re-reading storage every second.
  useEffect(() => {
    const timer = window.setInterval(() => setTick((n) => n + 1), 20_000);
    return () => window.clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <Container className="py-12">
        <Skeleton className="mx-auto h-72 max-w-lg rounded-card" />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={SearchX}
          title={t.item.notFoundTitle}
          description={t.item.notFoundBody}
          action={
            <Button asChild>
              <Link href="/account/orders">{t.orders.title}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const flags = flagsFor(order);
  const isOpen = order.status !== "HANDED_OVER" && order.status !== "CANCELLED";
  const isAccepted = !!order.estimatedReadyAt && order.status !== "PLACED";
  const minutesLeft = order.estimatedReadyAt ? minutesUntil(order.estimatedReadyAt) : null;
  const startAt =
    settings && order.isScheduled ? scheduledStartAt(order, settings.basePrepBufferMinutes) : null;

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder(order.id, t.track.cancelReason);
      toast.success(t.track.cancelTitle);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsCancelling(false);
    }
  };

  /** The one line that answers "when do I get my food?". */
  const timeHeadline = () => {
    if (order.status === "CANCELLED") return t.track.steps.cancelled;
    if (order.status === "HANDED_OVER")
      return order.orderType === "TAKEAWAY"
        ? t.track.steps.handedOverTakeaway
        : t.track.steps.handedOverDineIn;
    if (order.status === "READY") return t.track.readyNow;
    if (order.isScheduled && order.scheduledFor)
      return t.track.scheduledFor(formatTime(order.scheduledFor));
    if (!isAccepted) return t.track.waitingConfirm;
    return t.track.readyBy(formatTime(order.estimatedReadyAt!));
  };

  const timeDetail = () => {
    if (!isOpen) return null;
    if (order.status === "READY") return t.track.showAtCounter;
    if (order.isScheduled && startAt) return t.track.willStartAt(formatTime(startAt));
    if (!isAccepted) return t.track.usuallyAbout(15);
    // Past the promise but not ready: never show a negative countdown.
    if (minutesLeft === null || minutesLeft <= 0) return t.track.almostReady;
    return t.track.inMinutes(minutesLeft);
  };

  return (
    <Container className="py-6 pb-16 sm:py-10">
      <div className="mx-auto max-w-2xl">
        {/* Token — the only thing the counter asks for. */}
        <Card className="p-6 text-center">
          <p className="text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
            {t.confirm.tokenLabel}
          </p>
          <p className="text-display nums mt-1 text-[clamp(3.5rem,20vw,6rem)] leading-none text-brand">
            {order.tokenNumber}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{t.track.showAtCounter}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">
              {order.orderType === "TAKEAWAY"
                ? t.orderType.takeaway
                : order.tableNumber
                  ? t.track.dineInTable(order.tableNumber)
                  : t.orderType.dineIn}
            </Badge>
            <Badge variant="muted">{t.confirm.orderNumber(order.id)}</Badge>
            {flags.isOverdue && <Badge variant="warning">{t.track.almostReady}</Badge>}
          </div>
        </Card>

        {/* When. */}
        <Card
          className={`mt-4 p-5 text-center ${order.status === "READY" ? "border-veg/30 bg-veg/5" : ""}`}
        >
          <p className="flex items-center justify-center gap-2 text-lg font-semibold text-ink">
            <Clock size={20} strokeWidth={1.75} className="text-brand" aria-hidden="true" />
            {timeHeadline()}
          </p>
          {timeDetail() && (
            <p className="nums mt-1 text-sm text-ink-muted">{timeDetail()}</p>
          )}
        </Card>

        <div className="mt-4 grid gap-4">
          <PaymentCard order={order} />

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">{t.track.timeline}</h2>
            <StatusTimeline order={order} />
          </Card>

          {/* Items and totals; the print stylesheet keeps just this block. */}
          <Card className="p-5 print:border-0 print:shadow-none" id="receipt">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold text-ink">{t.track.details}</h2>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-brand print:hidden"
              >
                <Printer size={14} aria-hidden="true" />
                {t.track.print}
              </button>
            </div>

            <ul className="mt-3 grid gap-2.5">
              {order.lines.map((line, index) => (
                <li key={`${line.menuItemId}-${index}`} className="flex items-start gap-2.5">
                  <VegMark isVeg={line.isVeg} size="sm" className="mt-1" />
                  <span className="min-w-0 flex-1">
                    <span className="nums block text-sm text-ink">
                      {line.quantity} × {pick(line.name)}
                    </span>
                    {line.options.length > 0 && (
                      <span className="block text-xs text-ink-muted">
                        {line.options.map((option) => pick(option.name)).join(" · ")}
                      </span>
                    )}
                    {line.notes && (
                      <span className="block text-xs text-ink-muted italic">
                        {t.track.notes(line.notes)}
                      </span>
                    )}
                  </span>
                  <Price value={line.lineTotal} size="sm" />
                </li>
              ))}
            </ul>

            <dl className="mt-4 grid gap-2 border-t border-hairline pt-4">
              <Row label={t.cartPage.subtotal} value={formatPrice(order.subtotal)} />
              {order.discount > 0 && (
                <Row
                  label={
                    order.couponCode
                      ? t.cartPage.discountWithCode(order.couponCode)
                      : t.cartPage.discount
                  }
                  value={`−${formatPrice(order.discount)}`}
                />
              )}
              {order.packagingCharge > 0 && (
                <Row label={t.cartPage.packaging} value={formatPrice(order.packagingCharge)} />
              )}
              <Row label={t.cartPage.gst(order.taxRate)} value={formatPrice(order.tax)} />
              <div className="mt-1 flex justify-between gap-4 border-t border-hairline pt-3">
                <dt className="text-base font-semibold text-ink">{t.cartPage.total}</dt>
                <dd>
                  <Price value={order.total} size="xl" />
                </dd>
              </div>
            </dl>

            {order.notes && (
              <p className="mt-4 rounded-control bg-sand-50 p-3 text-sm text-ink-muted">
                {t.track.notes(order.notes)}
              </p>
            )}
          </Card>

          {/* Where. */}
          <Card className="p-5 print:hidden">
            <h2 className="text-sm font-semibold text-ink">{t.track.pickupTitle}</h2>
            <p className="mt-2 flex items-start gap-2.5 text-sm text-ink">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              {STORE.addressFull}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <a href={`tel:${STORE.phoneHref}`}>
                  <Phone aria-hidden="true" />
                  {t.track.callStore}
                </a>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {t.track.directions}
                </a>
              </Button>
            </div>
          </Card>

          {flags.canCustomerCancel && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive-ghost" className="print:hidden">
                  {t.track.cancelOrder}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.track.cancelTitle}</DialogTitle>
                  <DialogDescription>{t.track.cancelBody}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">{t.track.cancelKeep}</Button>
                  <Button
                    variant="destructive"
                    disabled={isCancelling}
                    onClick={() => void handleCancel()}
                  >
                    {t.track.cancelConfirm}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <p className="nums mt-6 text-center text-xs text-ink-muted print:hidden">
          {formatDateTime(order.createdAt)}
        </p>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="nums text-sm text-ink">{value}</dd>
    </div>
  );
}
