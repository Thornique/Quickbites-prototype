"use client";

import Link from "next/link";
import { History, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLowStock } from "@/features/inventory";
import { useRecentActivity } from "@/features/reports";
import { useT } from "@/i18n";
import { formatDayTime } from "@/lib/format";
import { stockStatus } from "@/services/inventory";

/** Anything at or below its reorder level, worst first. */
export function LowStockPanel() {
  const t = useT();
  const { data: items, isLoading } = useLowStock();
  const rows = (items ?? []).slice(0, 6);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t.adm.dashboard.lowStock}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {t.adm.dashboard.lowStockBody}
          </p>
        </div>
        <PackageOpen
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-ink-muted/70"
        />
      </div>

      {isLoading && <Skeleton className="mt-3 h-24 w-full" />}

      {!isLoading && rows.length === 0 && (
        <p className="mt-3 text-sm text-ink-muted">{t.adm.dashboard.lowStockNone}</p>
      )}

      {rows.length > 0 && (
        <>
          <ul className="mt-3 grid gap-1.5">
            {rows.map((item) => {
              const status = stockStatus(item);
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-hairline pb-1.5 last:border-0 last:pb-0"
                >
                  <span className="min-w-0 truncate text-sm text-ink">{item.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="nums text-sm font-semibold text-ink">
                      {t.adm.dashboard.units(item.qty, item.unit)}
                    </span>
                    <Badge variant={status === "OUT" ? "danger" : "warning"}>
                      {status === "OUT" ? t.menuCard.soldOut : t.adm.dashboard.lowStock}
                    </Badge>
                  </span>
                </li>
              );
            })}
          </ul>
          <Link
            href="/admin/inventory"
            className="mt-3 inline-block text-xs font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
          >
            {t.adm.nav.inventory}
          </Link>
        </>
      )}
    </Card>
  );
}

/** What the team did, newest first — the audit log at a glance. */
export function ActivityPanel() {
  const t = useT();
  const { data: entries, isLoading } = useRecentActivity(8);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{t.adm.dashboard.activity}</h2>
        <History
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-ink-muted/70"
        />
      </div>

      {isLoading && <Skeleton className="mt-3 h-24 w-full" />}

      {!isLoading && (entries ?? []).length === 0 && (
        <p className="mt-3 text-sm text-ink-muted">{t.adm.dashboard.activityNone}</p>
      )}

      <ol className="mt-3 grid gap-2.5">
        {(entries ?? []).map((entry) => (
          <li key={entry.id} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand/50"
            />
            <div className="min-w-0">
              <p className="text-sm leading-snug text-ink">{entry.summary}</p>
              <p className="nums mt-0.5 text-xs text-ink-muted">
                {t.adm.orders.by(entry.byName)} · {formatDayTime(entry.at)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
