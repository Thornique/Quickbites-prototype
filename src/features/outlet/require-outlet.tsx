"use client";

import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { usePick, useT } from "@/i18n";
import { OUTLET_LIST } from "@/lib/outlets";
import type { OutletId } from "@/types";
import { useAdminOutlet } from "./use-admin-outlet";

/**
 * Gate for the screens that cannot mean "both outlets".
 *
 * A menu item, a coupon, a stock line, a banner or a set of opening hours
 * belongs to one shop, so the combined view has nothing coherent to show and
 * nowhere to save to. Rather than disabling half the page, this asks which
 * outlet — and the buttons set the scope, so the answer sticks for the
 * screens that follow.
 */
export function RequireOutlet({
  children,
}: {
  children: (outletId: OutletId) => React.ReactNode;
}) {
  const t = useT();
  const pick = usePick();
  const { outletId, isAll, setScope } = useAdminOutlet();

  if (!isAll && outletId) return <>{children(outletId)}</>;

  return (
    <EmptyState
      icon={Store}
      title={t.adm.outlet.pickTitle}
      description={t.adm.outlet.pickBody}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          {OUTLET_LIST.map((outlet) => (
            <Button
              key={outlet.id}
              variant="outline"
              onClick={() => setScope(outlet.id)}
            >
              {pick(outlet.name)}
            </Button>
          ))}
        </div>
      }
    />
  );
}
