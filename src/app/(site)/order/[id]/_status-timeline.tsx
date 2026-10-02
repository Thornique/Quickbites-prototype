"use client";

import { Check, X } from "lucide-react";
import { useT } from "@/i18n";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

/** The journey a customer is shown, in the order it actually happens. */
const SEQUENCE: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY", "HANDED_OVER"];

export function StatusTimeline({ order }: { order: Order }) {
  const t = useT();
  const isCancelled = order.status === "CANCELLED";

  const timeOf = (status: OrderStatus) =>
    order.statusHistory.find((event) => event.status === status)?.at;

  const labelFor = (status: OrderStatus): string => {
    switch (status) {
      case "PLACED":
        return t.track.steps.placed;
      case "ACCEPTED":
        return t.track.steps.accepted;
      case "PREPARING":
        return t.track.steps.preparing;
      case "READY":
        return t.track.steps.ready;
      default:
        return order.orderType === "TAKEAWAY"
          ? t.track.steps.handedOverTakeaway
          : t.track.steps.handedOverDineIn;
    }
  };

  const currentIndex = SEQUENCE.indexOf(order.status);
  const verifiedAt = order.paymentHistory.find(
    (event) => event.action === "PAYMENT_VERIFIED" || event.action === "CASH_RECEIVED",
  )?.at;

  /*
    Payment verification is slotted in after "placed" rather than treated as a
    status, because it is the step the customer is actually waiting on before
    the kitchen can start.
  */
  const rows: Array<{ key: string; label: string; at?: number; done: boolean; active: boolean }> =
    [];

  SEQUENCE.forEach((status, index) => {
    rows.push({
      key: status,
      label: labelFor(status),
      at: timeOf(status),
      done: !isCancelled && currentIndex >= index,
      active: !isCancelled && currentIndex === index,
    });
    if (status === "PLACED") {
      rows.push({
        key: "PAYMENT",
        label: t.track.steps.paymentVerified,
        at: verifiedAt,
        done: !!verifiedAt,
        active: !verifiedAt && !isCancelled,
      });
    }
  });

  if (isCancelled) {
    const cancelled = order.statusHistory.find((event) => event.status === "CANCELLED");
    rows.push({
      key: "CANCELLED",
      label: cancelled?.reason
        ? t.track.cancelledReason(cancelled.reason)
        : t.track.steps.cancelled,
      at: cancelled?.at,
      done: true,
      active: true,
    });
  }

  return (
    <ol className="relative grid gap-0">
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        const isCancelRow = row.key === "CANCELLED";
        return (
          <li key={row.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  isCancelRow
                    ? "border-danger bg-danger text-white"
                    : row.done
                      ? "border-veg bg-veg text-white"
                      : "border-hairline bg-surface",
                  row.active && !row.done && !isCancelRow && "border-brand",
                )}
              >
                {isCancelRow ? (
                  <X size={14} strokeWidth={3} aria-hidden="true" />
                ) : row.done ? (
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      row.active ? "animate-pulse bg-brand" : "bg-hairline",
                    )}
                  />
                )}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn("w-0.5 flex-1", row.done ? "bg-veg/40" : "bg-hairline")}
                />
              )}
            </div>

            <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
              <p
                className={cn(
                  "text-sm leading-tight",
                  row.done || row.active ? "font-semibold text-ink" : "text-ink-muted",
                )}
              >
                {row.label}
              </p>
              {row.at && (
                <p className="nums mt-0.5 text-xs text-ink-muted">{formatTime(row.at)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
