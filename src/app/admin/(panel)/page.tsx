"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import {
  DateRangePicker,
  resolvePreset,
  type RangePreset,
} from "@/components/admin/date-range-picker";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { useSession } from "@/features/auth";
import { useT } from "@/i18n";
import { can } from "@/lib/permissions";
import type { DateRange } from "@/services/reports";
import {
  OnTimeCard,
  OrderTypeSplitChart,
  OrdersByHourChart,
  PaymentSplitChart,
  RevenueChart,
  TopItemsChart,
} from "./_dashboard/charts-lazy";
import { KpiGrid } from "./_dashboard/kpi-grid";
import { LiveBoard } from "./_dashboard/live-board";
import { ActivityPanel, LowStockPanel } from "./_dashboard/side-panels";

/**
 * The admin dashboard.
 *
 * Two clocks on one page: the KPIs and the live board always speak about right
 * now, because that is what the counter needs, while the charts follow the
 * period control. Every figure comes from the services and re-reads on
 * cross-tab sync, so a customer paying in another tab moves these numbers
 * without a refresh.
 *
 * Sections an admin has no permission for are left out rather than shown empty
 * — a zero that only means "not allowed" is worse than no card at all.
 */
export default function AdminDashboardPage() {
  const t = useT();
  const { user } = useSession();
  const [preset, setPreset] = useState<RangePreset>("last30");
  const [range, setRange] = useState<DateRange>(() => resolvePreset("last30"));

  const maySeeReports = can(user, "REPORTS");

  return (
    <>
      <PageHeader
        title={t.adm.dashboard.title}
        description={t.adm.dashboard.subtitle}
        actions={
          maySeeReports && (
            <DateRangePicker
              preset={preset}
              range={range}
              onChange={(nextPreset, nextRange) => {
                setPreset(nextPreset);
                setRange(nextRange);
              }}
            />
          )
        }
      />

      <KpiGrid />

      {can(user, "ORDERS") && (
        <div className="mt-4">
          <LiveBoard />
        </div>
      )}

      {maySeeReports ? (
        <>
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            <RevenueChart range={range} />
            <TopItemsChart range={range} />
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-3">
            <OrdersByHourChart />
            <OrderTypeSplitChart range={range} />
            <PaymentSplitChart range={range} />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <OnTimeCard range={range} />
            {can(user, "INVENTORY") && <LowStockPanel />}
            <ActivityPanel />
          </div>
        </>
      ) : (
        <>
          {can(user, "INVENTORY") && (
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <LowStockPanel />
            </div>
          )}

          {/* Said plainly, rather than drawing charts full of zeros. */}
          <Card className="mt-3 flex items-start gap-3 p-5">
            <Lock
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-ink-muted"
            />
            <p className="measure text-sm text-ink-muted">
              {t.guard.forbiddenBody(t.permissions.REPORTS)}
            </p>
          </Card>
        </>
      )}
    </>
  );
}
