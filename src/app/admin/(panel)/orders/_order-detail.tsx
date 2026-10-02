"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Printer, Receipt } from "lucide-react";
import { PaymentBadge, StatusBadge } from "@/components/admin/badges";
import { FormSheet } from "@/components/admin/form-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VegMark } from "@/components/ui/veg-mark";
import { usePick, useT } from "@/i18n";
import { formatDateTime, formatPrice, formatTime } from "@/lib/format";
import { useAdminNames, useOrder } from "@/features/orders";
import { OrderActions } from "./_order-actions";
import { BillLayout, KotLayout, printDocument } from "./_print";
import type { Order, PaymentAction } from "@/types";

/**
 * Everything about one order, plus the actions and the two printouts.
 *
 * It re-reads the order by id rather than trusting the row that opened it, so
 * the sheet follows along when a colleague in another tab accepts or cancels
 * what you are looking at.
 */
export function OrderDetailSheet({
  order: initial,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const pick = usePick();
  const { data: live } = useOrder(initial?.id ?? "");
  const { data: adminNames } = useAdminNames();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const order = live ?? initial;
  if (!order) return null;

  /** Admin names for the audit trails; falls back to "System". */
  const nameFor = (userId?: string) =>
    (userId ? adminNames?.[userId] : undefined) ?? t.adm.orders.system;

  /** Exhaustive by type: a new PaymentAction will fail to compile here. */
  const paymentLabel = (action: PaymentAction) => {
    switch (action) {
      case "ONLINE_PAID":
        return t.track.paidUnverified;
      case "PAYMENT_VERIFIED":
        return t.track.steps.paymentVerified;
      case "PAYMENT_REJECTED":
        return t.track.paymentFailed;
      case "CASH_RECEIVED":
        return t.adm.orders.recordCash;
      case "SWITCHED_TO_ONLINE":
        return t.track.payOnlineNow;
      case "REFUNDED":
        return t.track.refunded;
    }
  };

  return (
    <>
      <FormSheet
        open={open}
        onOpenChange={onOpenChange}
        title={t.adm.orders.detailTitle(order.tokenNumber)}
        description={order.id}
        width="lg"
        secondaryActions={
          <>
            <Button variant="outline" size="sm" onClick={() => printDocument("kot")}>
              <Printer aria-hidden="true" />
              {t.adm.orders.printKot}
            </Button>
            <Button variant="outline" size="sm" onClick={() => printDocument("bill")}>
              <Receipt aria-hidden="true" />
              {t.adm.orders.printBill}
            </Button>
          </>
        }
      >
        <div className="grid gap-5">
          {/* State and the action that follows from it. */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} orderType={order.orderType} />
            <PaymentBadge order={order} />
            <Badge variant="muted">
              {order.orderType === "TAKEAWAY"
                ? t.orderType.takeaway
                : order.tableNumber
                  ? `${t.orderType.dineIn} · ${t.adm.orders.table(order.tableNumber)}`
                  : t.orderType.dineIn}
            </Badge>
          </div>

          <OrderActions order={order} layout="row" />

          {/* Who and when. */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-card border border-hairline bg-sand-50 p-3 text-sm">
            <div>
              <dt className="text-xs text-ink-muted">{t.adm.orders.colCustomer}</dt>
              <dd className="font-medium text-ink">{order.pickupName}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">{t.contact.phone}</dt>
              <dd className="nums font-medium text-ink">{order.phone}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-muted">{t.adm.orders.colPlaced}</dt>
              <dd className="nums font-medium text-ink">
                {formatDateTime(order.createdAt)}
              </dd>
            </div>
            {order.estimatedReadyAt && (
              <div>
                <dt className="text-xs text-ink-muted">{t.adm.orders.kot.readyBy}</dt>
                <dd className="nums font-medium text-ink">
                  {formatTime(order.estimatedReadyAt)}
                </dd>
              </div>
            )}
          </dl>

          {order.notes && (
            <p className="rounded-control border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-ink">
              {t.adm.orders.note(order.notes)}
            </p>
          )}

          {/* Items and money. */}
          <section>
            <h3 className="text-xs font-bold tracking-wide text-ink-muted uppercase">
              {t.adm.orders.kot.items}
            </h3>
            <ul className="mt-2 grid gap-2">
              {order.lines.map((line, index) => (
                <li
                  key={`${line.menuItemId}-${index}`}
                  className="flex items-start justify-between gap-3 border-b border-hairline pb-2 text-sm last:border-0"
                >
                  <span className="flex min-w-0 gap-2">
                    <span className="nums w-6 shrink-0 font-bold text-ink">
                      {line.quantity}×
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-start gap-1.5">
                        <VegMark isVeg={line.isVeg} size="sm" className="mt-0.5" />
                        <span className="font-medium text-ink">{pick(line.name)}</span>
                      </span>
                      {line.options.length > 0 && (
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {line.options.map((option) => pick(option.name)).join(", ")}
                        </span>
                      )}
                      {line.notes && (
                        <span className="mt-0.5 block text-xs font-medium text-warning-dark">
                          {line.notes}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="nums shrink-0 font-semibold text-ink">
                    {formatPrice(line.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-3 grid gap-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">{t.adm.orders.bill.subtotal}</dt>
                <dd className="nums text-ink">{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">
                    {t.adm.orders.bill.discount}
                    {order.couponCode ? ` · ${order.couponCode}` : ""}
                  </dt>
                  <dd className="nums text-veg-dark">-{formatPrice(order.discount)}</dd>
                </div>
              )}
              {order.packagingCharge > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">{t.adm.orders.bill.packaging}</dt>
                  <dd className="nums text-ink">{formatPrice(order.packagingCharge)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-muted">
                  {t.adm.orders.bill.tax} {order.taxRate}%
                </dt>
                <dd className="nums text-ink">{formatPrice(order.tax)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-hairline pt-1.5">
                <dt className="font-semibold text-ink">{t.adm.orders.bill.total}</dt>
                <dd className="nums text-base font-bold text-ink">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Audit trails. */}
          <section>
            <h3 className="text-xs font-bold tracking-wide text-ink-muted uppercase">
              {t.adm.orders.timeline}
            </h3>
            <ol className="mt-2 grid gap-2">
              {order.statusHistory.map((event, index) => (
                <li key={`${event.status}-${index}`} className="flex gap-2.5 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand/60"
                  />
                  <div>
                    <p className="text-ink">
                      <StatusBadge status={event.status} orderType={order.orderType} />
                    </p>
                    <p className="nums mt-0.5 text-xs text-ink-muted">
                      {formatDateTime(event.at)} · {t.adm.orders.by(nameFor(event.byUserId))}
                    </p>
                    {event.reason && (
                      <p className="mt-0.5 text-xs text-ink-muted">{event.reason}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3 className="text-xs font-bold tracking-wide text-ink-muted uppercase">
              {t.adm.orders.paymentHistory}
            </h3>
            <ol className="mt-2 grid gap-2">
              {order.paymentHistory.map((event, index) => (
                <li key={`${event.action}-${index}`} className="text-sm">
                  <p className="flex items-center justify-between gap-3">
                    <span className="font-medium text-ink">
                      {paymentLabel(event.action)}
                    </span>
                    <span className="nums text-ink">{formatPrice(event.amount)}</span>
                  </p>
                  <p className="nums mt-0.5 text-xs text-ink-muted">
                    {formatDateTime(event.at)} · {t.adm.orders.by(nameFor(event.byUserId))}
                    {event.ref ? ` · ${event.ref}` : ""}
                  </p>
                  {event.reason && (
                    <p className="mt-0.5 text-xs text-danger">{event.reason}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {order.readyTimeHistory.length > 0 && (
            <section>
              <h3 className="text-xs font-bold tracking-wide text-ink-muted uppercase">
                {t.adm.orders.readyTimeHistory}
              </h3>
              <ol className="mt-2 grid gap-1.5 text-sm">
                {order.readyTimeHistory.map((event, index) => (
                  <li key={`${event.at}-${index}`}>
                    <p className="nums text-ink">
                      {event.minutes > 0 ? `+${event.minutes}` : event.minutes} min ·{" "}
                      <span className="text-xs text-ink-muted">
                        {formatDateTime(event.at)} ·{" "}
                        {t.adm.orders.by(nameFor(event.byUserId))}
                      </span>
                    </p>
                    {event.reason && (
                      <p className="text-xs text-ink-muted">{event.reason}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </FormSheet>

      {/*
        The printouts go straight under <body> so the print stylesheet can hide
        everything else; inside the sheet they would be inside a hidden portal.
      */}
      {isMounted &&
        createPortal(
          <div className="print-portal hidden">
            <KotLayout order={order} />
            <BillLayout order={order} />
          </div>,
          document.body,
        )}
    </>
  );
}
