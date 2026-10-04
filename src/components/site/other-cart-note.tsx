"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutletBadge, useOutlet } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { OUTLET_IDS } from "@/types";
import { useOtherCartCount } from "@/store/cart";
import { getOutlet } from "@/lib/outlets";
import { cn } from "@/lib/utils";

/**
 * "3 items are still waiting in your Coffee cart."
 *
 * Each outlet keeps its own basket, which is right — but a basket nobody is
 * told about is a basket nobody checks out. This is the one line that says it
 * is still there, with the switch to get to it.
 */
export function OtherCartNote({ className }: { className?: string }) {
  const t = useT();
  const pick = usePick();
  const { outletId, setOutlet } = useOutlet();
  const count = useOtherCartCount(outletId);

  if (count === 0) return null;

  const otherId = OUTLET_IDS.find((id) => id !== outletId);
  if (!otherId) return null;
  const other = getOutlet(otherId);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-card border border-dashed border-hairline bg-sand-50 px-4 py-3",
        className,
      )}
    >
      <ShoppingBag
        size={18}
        strokeWidth={1.75}
        aria-hidden="true"
        className="shrink-0 text-ink-muted"
      />
      <p className="min-w-0 flex-1 text-sm text-ink">
        {t.outlet.otherCart(count, pick(other.shortName))}
      </p>
      <OutletBadge outletId={otherId} />
      <Button variant="outline" size="sm" onClick={() => setOutlet(otherId)}>
        {t.outlet.goToOtherCart}
      </Button>
    </div>
  );
}
