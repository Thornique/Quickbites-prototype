"use client";

import { useOpenState } from "@/features/settings";
import { useT } from "@/i18n";
import { formatSlotLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * "Open now · till 11 PM" / "Closed · opens 10 AM", computed from store
 * settings rather than hard-coded, so flipping the switch in the admin panel
 * changes it live in every open tab.
 */
export function StoreStatusPill({ className }: { className?: string }) {
  const t = useT();
  const { data, isLoading } = useOpenState();

  if (isLoading || !data) {
    return (
      <span
        className={cn(
          "inline-flex h-7 w-32 shrink-0 animate-pulse rounded-pill bg-sand-100",
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  const isOpen = data.isOpen && data.acceptingOrders;
  const detail = data.isOpen
    ? data.acceptingOrders
      ? t.store.tillTime(formatSlotLabel(data.closesAt ?? "23:00"))
      : t.store.pausedOrders
    : t.store.opensAt(formatSlotLabel(data.opensAt ?? "10:00"));

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold",
        isOpen
          ? "border-veg/25 bg-veg/10 text-veg-dark"
          : "border-hairline bg-sand-100 text-ink-muted",
        className,
      )}
    >
      <span className="sr-only">{t.store.statusLabel}: </span>
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", isOpen ? "bg-veg" : "bg-ink-muted/60")}
      />
      {data.isOpen ? t.store.openNow : t.store.closed}
      <span aria-hidden="true" className="opacity-40">
        ·
      </span>
      <span className="font-medium">{detail}</span>
    </span>
  );
}
