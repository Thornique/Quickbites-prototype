"use client";

import { Coffee, UtensilsCrossed } from "lucide-react";
import { getOutlet } from "@/lib/outlets";
import { usePick } from "@/i18n";
import { cn } from "@/lib/utils";
import type { OutletId } from "@/types";

const ICONS = { restaurant: UtensilsCrossed, coffee: Coffee } as const;

/**
 * Which outlet a record belongs to.
 *
 * Deliberately painted from the outlet rather than from the active accent: an
 * order card on the super admin's combined board, or a past order in the
 * customer's history, has to say which counter it was while the page around
 * it is themed for the other one.
 */
export function OutletBadge({
  outletId,
  className,
  variant = "default",
}: {
  outletId: OutletId;
  className?: string;
  /** `plain` drops the tinted pill, for dense table cells. */
  variant?: "default" | "plain";
}) {
  const pick = usePick();
  const outlet = getOutlet(outletId);
  const Icon = ICONS[outletId];
  const isCoffee = outletId === "coffee";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap",
        variant === "default" && "rounded-pill px-2 py-0.5",
        variant === "default" &&
          (isCoffee
            ? "bg-brand-coffee/10 text-brand-coffee"
            : "bg-brand-restaurant/10 text-brand-restaurant"),
        variant === "plain" && (isCoffee ? "text-brand-coffee" : "text-ink-muted"),
        className,
      )}
    >
      <Icon size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      {pick(outlet.shortName)}
    </span>
  );
}
