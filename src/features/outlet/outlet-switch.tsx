"use client";

import { Coffee, UtensilsCrossed } from "lucide-react";
import { OUTLET_LIST } from "@/lib/outlets";
import { cn } from "@/lib/utils";
import { usePick, useT } from "@/i18n";
import type { OutletId } from "@/types";
import { useOutlet } from "./index";

const ICONS = { restaurant: UtensilsCrossed, coffee: Coffee } as const;

/**
 * Restaurant / Coffee.
 *
 * A segmented control rather than a dropdown: there are two outlets and both
 * should be readable without a click, the same way a quick-service brand shows
 * you the whole choice at once.
 */
export function OutletSwitch({
  className,
  size = "default",
}: {
  className?: string;
  /** `lg` is the full-width version inside the mobile navigation sheet. */
  size?: "default" | "lg";
}) {
  const t = useT();
  const pick = usePick();
  const { outletId, setOutlet } = useOutlet();
  /*
    The active pill is always the outlet the page is already themed for, so
    `bg-brand` on coffee is caramel while the restaurant keeps its mahogany
    fill — the restaurant's switch is unchanged.
  */
  const activeFill = outletId === "coffee" ? "bg-brand" : "bg-cocoa";

  return (
    <div
      role="radiogroup"
      aria-label={t.outlet.switchLabel}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-pill border border-hairline bg-sand-50 p-0.5",
        size === "lg" && "w-full",
        className,
      )}
    >
      {OUTLET_LIST.map((outlet) => {
        const Icon = ICONS[outlet.id as OutletId];
        const isActive = outlet.id === outletId;

        return (
          <button
            key={outlet.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setOutlet(outlet.id)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-pill px-3 py-1.5",
              "text-sm font-semibold whitespace-nowrap transition-colors duration-150",
              /* Only the full-width sheet version shares the row equally; in
                 the header each pill sizes to its own label, or "Restaurant"
                 truncates the moment the coffee wordmark widens the bar. */
              size === "lg" && "min-w-0 flex-1",
              "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
              size === "lg" && "py-2.5",
              isActive
                ? `${activeFill} text-white`
                : "text-ink-muted hover:bg-surface hover:text-ink",
            )}
          >
            <Icon
              size={16}
              strokeWidth={1.75}
              aria-hidden="true"
              className="shrink-0"
            />
            <span className={size === "lg" ? "truncate" : undefined}>
              {pick(outlet.shortName)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
