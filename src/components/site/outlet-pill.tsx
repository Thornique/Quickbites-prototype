"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * The address pill chains put next to their order-mode switch. Quick Bites has
 * exactly one outlet, so there is nothing to pick — it states where the food
 * is collected and links to the full contact details.
 */
export function OutletPill({ className }: { className?: string }) {
  const t = useT();

  return (
    <Link
      href="/contact"
      aria-label={t.header.outletAria}
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-pill border border-hairline bg-sand-50 px-3 py-1.5",
        "text-sm font-medium text-ink transition-colors",
        "hover:border-brand/40 hover:bg-surface",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        className,
      )}
    >
      <MapPin
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="shrink-0 text-brand"
      />
      <span className="truncate">{t.header.outletAddress}</span>
    </Link>
  );
}
