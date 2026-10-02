"use client";

import { Clock } from "lucide-react";
import { useOpenState } from "@/features/settings";
import { useT } from "@/i18n";
import { formatSlotLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Shown while the store is shut or has paused orders. Browsing stays open —
 * only the add buttons go dead — so a customer can still plan an order and
 * see when ordering reopens.
 */
export function StoreClosedBanner({ className }: { className?: string }) {
  const t = useT();
  const { data } = useOpenState();

  if (!data) return null;
  if (data.isOpen && data.acceptingOrders) return null;

  const isPaused = data.isOpen && !data.acceptingOrders;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-card border border-warning/30 bg-warning/10 p-4",
        className,
      )}
    >
      <Clock
        size={20}
        strokeWidth={1.75}
        className="mt-0.5 shrink-0 text-warning-dark"
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-semibold text-ink">
          {isPaused ? t.closed.pausedTitle : t.closed.title}
        </p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {isPaused
            ? t.closed.pausedBody
            : t.closed.body(formatSlotLabel(data.opensAt ?? "10:00"))}
        </p>
      </div>
    </div>
  );
}
