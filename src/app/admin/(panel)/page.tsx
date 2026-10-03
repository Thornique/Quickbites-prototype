"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import {
  DateRangePicker,
  resolvePreset,
  type RangePreset,
} from "@/components/admin/date-range-picker";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { useSession } from "@/features/auth";
import { useLocale, useT } from "@/i18n";
import { formatLongDate, hourOfDay } from "@/lib/format";
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
import { AttentionPanel } from "./_dashboard/attention";
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
 *
 * The order is the order of use: what needs doing, then what the day looks
 * like, then the board, then the figures somebody will study.
 */
export default function AdminDashboardPage() {
  const t = useT();
  const { locale } = useLocale();
  const { user } = useSession();
  const [preset, setPreset] = useState<RangePreset>("last30");
  const [range, setRange] = useState<DateRange>(() => resolvePreset("last30"));

  const maySeeReports = can(user, "REPORTS");

  // Set after mount: the greeting reads the clock, and a server render has no
  // business guessing what time it is on the counter in Khandwa.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const greeting = (() => {
    if (!now || !user) return t.adm.dashboard.subtitle;
    const firstName = user.name.split(" ")[0];
    const hour = hourOfDay(now);
    const hello =
      hour < 12
        ? t.adm.dashboard.greetingMorning(firstName)
        : hour < 17
          ? t.adm.dashboard.greetingAfternoon(firstName)
          : t.adm.dashboard.greetingEvening(firstName);
    return `${hello} — ${t.adm.dashboard.greetingDate(formatLongDate(now, locale))}`;
  })();

  return (
    <>
      <PageHeader
        title={t.adm.dashboard.title}
        description={greeting}
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

      <AttentionPanel />

      <div className="mt-3">
        <KpiGrid />
      </div>

      {can(user, "ORDERS") && (
        <div className="mt-3">
          <LiveBoard />
        </div>
      )}

      {maySeeReports ? (
        <>
          <div className="mt-3 grid gap-3 xl:grid-cols-3">
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
        // Paired so neither is left stranded beside empty space.
        <div className="mt-3 grid items-start gap-3 lg:grid-cols-2">
          {can(user, "INVENTORY") && <LowStockPanel />}

          {/* Said plainly, rather than drawing charts full of zeros. */}
          <Card className="flex items-start gap-3 p-5">
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
        </div>
      )}
    </>
  );
}
