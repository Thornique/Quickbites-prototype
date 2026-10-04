"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { useOutlet } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Where the food is collected from. It states the ACTIVE outlet's address and
 * links to the full contact details, which list both — the switcher next to it
 * is what changes outlet, so this stays a statement rather than a second
 * control saying the same thing.
 */
export function OutletPill({ className }: { className?: string }) {
  const t = useT();
  const pick = usePick();
  const { outlet } = useOutlet();
  const address = pick(outlet.address);

  return (
    <Link
      href="/contact"
      aria-label={t.header.outletAria(address)}
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
      <span className="truncate">{address}</span>
    </Link>
  );
}
