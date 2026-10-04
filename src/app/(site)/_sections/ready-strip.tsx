"use client";

import { Clock, MapPin, ShoppingBag, Tag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteContent } from "@/features/content";
import { useOutlet } from "@/features/outlet";
import { useOpenState, usePrepEstimate } from "@/features/settings";
import { usePick, useT } from "@/i18n";
import { formatSlotLabel } from "@/lib/format";

/**
 * Live "ready in about N minutes" band. The number comes from the same
 * prep-time calculator checkout uses, including the current kitchen queue, so
 * it rises as orders come in and updates across tabs.
 */
export function ReadyStrip() {
  const t = useT();
  const pick = usePick();
  const { outletId, outlet } = useOutlet();
  const { data: openState, isLoading: openLoading } = useOpenState(outletId);
  const { data: minutes, isLoading: minutesLoading } = usePrepEstimate(outletId);
  const { data: content } = useSiteContent();
  const outletCopy = content?.outlets[outletId];
  const offer = outletCopy ? pick(outletCopy.offersStrip).trim() : "";

  if (openLoading || minutesLoading || !openState) {
    return (
      <div className="border-b border-hairline bg-surface">
        <Container className="py-4">
          <Skeleton className="h-6 w-full max-w-2xl" />
        </Container>
      </div>
    );
  }

  const canOrder = openState.isOpen && openState.acceptingOrders;

  return (
    <div className="border-b border-hairline bg-surface">
      <Container className="flex flex-wrap items-center gap-x-6 gap-y-2.5 py-3.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Clock
            size={18}
            strokeWidth={1.75}
            className="shrink-0 text-brand"
            aria-hidden="true"
          />
          {canOrder && typeof minutes === "number"
            ? t.ready.readyIn(minutes)
            : openState.isOpen
              ? t.store.pausedOrders
              : `${t.ready.closedNow} · ${t.ready.opensAt(formatSlotLabel(openState.opensAt ?? "10:00"))}`}
        </p>

        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <MapPin
            size={18}
            strokeWidth={1.75}
            className="shrink-0"
            aria-hidden="true"
          />
          <span>
            <span className="sr-only">{t.ready.pickUpAt} </span>
            {pick(outlet.address)}
          </span>
        </p>

        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <ShoppingBag
            size={18}
            strokeWidth={1.75}
            className="shrink-0"
            aria-hidden="true"
          />
          {t.ready.dineInOrTakeaway}
        </p>

        {/*
          Whatever the admin typed into Content → Offers strip. On coffee it
          becomes a filled caramel chip — the one spot of saturated colour in
          an otherwise creamy band, which is what stops the strip reading flat.
        */}
        {offer && (
          <p
            className={
              outletId === "coffee"
                ? "coffee-gradient inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-sm font-semibold text-white"
                : "flex items-center gap-2 text-sm font-semibold text-brand"
            }
          >
            <Tag size={18} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
            {offer}
          </p>
        )}
      </Container>
    </div>
  );
}
