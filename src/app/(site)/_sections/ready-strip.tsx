"use client";

import { Clock, MapPin, ShoppingBag, Tag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteContent } from "@/features/content";
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
  const { data: openState, isLoading: openLoading } = useOpenState();
  const { data: minutes, isLoading: minutesLoading } = usePrepEstimate();
  const { data: content } = useSiteContent();
  const offer = content ? pick(content.offersStrip).trim() : "";

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
            {t.ready.addressShort}
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

        {/* Whatever the admin typed into Content → Offers strip. */}
        {offer && (
          <p className="flex items-center gap-2 text-sm font-semibold text-brand">
            <Tag
              size={18}
              strokeWidth={1.75}
              className="shrink-0"
              aria-hidden="true"
            />
            {offer}
          </p>
        )}
      </Container>
    </div>
  );
}
