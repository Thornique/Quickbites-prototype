"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoardCounts } from "@/features/orders";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Counts by stage, straight above the board itself.
 *
 * Deliberately not a chart: these numbers exist to be clicked. Each one is a
 * link into Orders, because seeing "4 waiting to be verified" and then having
 * to find them is the wrong way round.
 */
export function LiveBoard() {
  const t = useT();
  const { data: counts, isLoading } = useBoardCounts();

  const stages = [
    {
      label: t.adm.orders.columns.verify,
      value: counts?.PLACED ?? 0,
      tone: "warning" as const,
    },
    { label: t.adm.orders.columns.accepted, value: counts?.ACCEPTED ?? 0 },
    { label: t.adm.orders.columns.preparing, value: counts?.PREPARING ?? 0 },
    {
      label: t.adm.orders.columns.ready,
      value: counts?.READY ?? 0,
      tone: "success" as const,
    },
    { label: t.adm.orders.columns.handedOver, value: counts?.HANDED_OVER ?? 0 },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t.adm.dashboard.board}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">{t.adm.dashboard.boardHint}</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
        >
          {t.adm.dashboard.openBoard}
          <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="mt-3 h-20 w-full" />
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {stages.map((stage) => (
            <li key={stage.label}>
              <Link
                href="/admin/orders"
                className={cn(
                  "block rounded-control border px-3 py-2.5 transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
                  stage.tone === "warning" && stage.value > 0
                    ? "border-warning/30 bg-warning/5 hover:border-warning"
                    : stage.tone === "success" && stage.value > 0
                      ? "border-veg/25 bg-veg/5 hover:border-veg"
                      : "border-hairline bg-sand-50 hover:border-ink-muted",
                )}
              >
                <span className="nums block text-xl font-bold text-ink">
                  {stage.value}
                </span>
                <span className="mt-0.5 block text-xs leading-tight text-ink-muted">
                  {stage.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
