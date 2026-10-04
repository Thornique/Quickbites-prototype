"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { ChartCard } from "@/components/admin/chart-card";

/* Recharts is the biggest thing on this route and the tables matter more. */
const HourlyOrdersChart = dynamic(
  () => import("./_hourly-chart").then((m) => m.HourlyOrdersChart),
  { ssr: false },
);
import {
  DateRangePicker,
  resolvePreset,
  type RangePreset,
} from "@/components/admin/date-range-picker";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireAdmin } from "@/features/auth";
import { OutletBadge, useAdminOutlet } from "@/features/outlet";
import {
  useItemPerformance,
  useOrderTypeSplit,
  useOrdersByHour,
  usePaymentSplit,
  usePrepTimeAccuracy,
  useReportScope,
  useSalesByOutlet,
  useSalesSummary,
} from "@/features/reports";
import { usePick, useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { getOutlet } from "@/lib/outlets";
import { toCsv, type DateRange } from "@/services/reports";

/** "14" → "2 PM". */
function hourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function download(name: string, rows: Array<Record<string, string | number>>) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Small CSV button, repeated per report. */
function CsvButton({
  name,
  rows,
  label,
}: {
  name: string;
  rows: Array<Record<string, string | number>>;
  label: string;
}) {
  return (
    <Button
      variant="outline"
      size="xs"
      className="print:hidden"
      disabled={rows.length === 0}
      onClick={() => {
        download(name, rows);
        toast.success(label);
      }}
    >
      <Download aria-hidden="true" />
      CSV
    </Button>
  );
}

function ReportsModule() {
  const t = useT();
  const pick = usePick();
  const { isAll } = useAdminOutlet();
  const [preset, setPreset] = useState<RangePreset>("last30");
  const [range, setRange] = useState<DateRange>(() => resolvePreset("last30"));

  // The period plus whichever outlet the topbar is scoped to.
  const scope = useReportScope(range);

  const { data: summary, isLoading } = useSalesSummary(scope);
  const { data: hours } = useOrdersByHour(scope);
  const { data: items } = useItemPerformance(scope);
  const { data: payments } = usePaymentSplit(scope);
  const { data: types } = useOrderTypeSplit(scope);
  const { data: prep } = usePrepTimeAccuracy(scope);
  const { data: byOutlet } = useSalesByOutlet(scope);

  const current = summary?.current;
  const top = (items ?? []).slice(0, 10);

  const hourRows = (hours ?? [])
    .map((count, hour) => ({ hour: hourLabel(hour), orders: count }))
    .slice(9, 24);

  return (
    <>
      <PageHeader
        title={t.adm.reports.title}
        description={t.adm.reports.subtitle}
        actions={
          <>
            <DateRangePicker
              preset={preset}
              range={range}
              onChange={(nextPreset, nextRange) => {
                setPreset(nextPreset);
                setRange(nextRange);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="print:hidden"
              onClick={() => window.print()}
            >
              <Printer aria-hidden="true" />
              {t.adm.reports.print}
            </Button>
          </>
        }
      />

      {/*
        0. Which outlet earned it. Only on the combined view: with one outlet
           selected this table would be the summary above, repeated once.
      */}
      {isAll && byOutlet && byOutlet.length > 1 && (
        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">{t.adm.reports.byOutlet}</h2>
            <CsvButton
              name="sales-by-outlet"
              label={t.adm.reports.byOutlet}
              rows={byOutlet.map((row) => ({
                outlet: getOutlet(row.outletId).name.en,
                orders: row.summary.orderCount,
                net_sales: row.summary.netSales,
                items: row.summary.itemCount,
                average_order_value: row.summary.averageOrderValue,
              }))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {byOutlet.map((row) => (
              <Card key={row.outletId} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-display text-base text-ink uppercase">
                    {pick(getOutlet(row.outletId).name)}
                  </h3>
                  <OutletBadge outletId={row.outletId} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-xs text-ink-muted">{t.adm.reports.netSales}</dt>
                    <dd className="nums text-lg font-bold text-ink">
                      {formatPrice(row.summary.netSales)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">
                      {t.adm.reports.orderCount}
                    </dt>
                    <dd className="nums text-lg font-bold text-ink">
                      {row.summary.orderCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">{t.adm.reports.aov}</dt>
                    <dd className="nums text-sm font-semibold text-ink">
                      {formatPrice(row.summary.averageOrderValue)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-muted">
                      {t.adm.reports.itemCount}
                    </dt>
                    <dd className="nums text-sm font-semibold text-ink">
                      {row.summary.itemCount}
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 1. Sales summary, against the previous period of equal length. */}
      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">
            {t.adm.reports.salesSummary}
          </h2>
          <CsvButton
            name="sales-summary"
            label={t.adm.reports.salesSummary}
            rows={
              current
                ? [
                    {
                      grossSales: current.grossSales,
                      discounts: current.discounts,
                      tax: current.tax,
                      packaging: current.packaging,
                      netSales: current.netSales,
                      orders: current.orderCount,
                      items: current.itemCount,
                      averageOrderValue: current.averageOrderValue,
                    },
                  ]
                : []
            }
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label={t.adm.reports.grossSales}
            value={formatPrice(current?.grossSales ?? 0)}
            delta={summary?.netSalesDelta}
            deltaLabel={t.adm.reports.compare}
            isLoading={isLoading}
          />
          <StatCard
            label={t.adm.reports.discounts}
            value={formatPrice(current?.discounts ?? 0)}
            isLoading={isLoading}
          />
          <StatCard
            label={t.adm.reports.tax}
            value={formatPrice(current?.tax ?? 0)}
            isLoading={isLoading}
          />
          <StatCard
            label={t.adm.reports.netSales}
            value={formatPrice(current?.netSales ?? 0)}
            isLoading={isLoading}
          />
          <StatCard
            label={t.adm.reports.orderCount}
            value={current?.orderCount ?? 0}
            isLoading={isLoading}
          />
          <StatCard
            label={t.adm.reports.aov}
            value={formatPrice(current?.averageOrderValue ?? 0)}
            isLoading={isLoading}
          />
        </div>
      </section>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {/* 2. Orders by hour. */}
        <ChartCard
          title={t.adm.reports.heatmap}
          description={t.adm.reports.heatmapHint}
          isLoading={isLoading}
          isEmpty={hourRows.every((row) => row.orders === 0)}
          legend={
            <CsvButton
              name="orders-by-hour"
              label={t.adm.reports.heatmap}
              rows={hourRows}
            />
          }
        >
          <HourlyOrdersChart rows={hourRows} />
        </ChartCard>

        {/* 3. Best sellers. */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">{t.adm.reports.topItems}</h2>
            <CsvButton
              name="top-items"
              label={t.adm.reports.topItems}
              rows={(items ?? []).map((item) => ({
                item: item.name,
                sold: item.quantity,
                revenue: item.revenue,
              }))}
            />
          </div>

          {isLoading ? (
            <Skeleton className="mt-3 h-48 w-full" />
          ) : top.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">{t.adm.reports.noData}</p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-muted">
                  <th className="pb-1.5 font-semibold">{t.adm.reports.colItem}</th>
                  <th className="pb-1.5 text-right font-semibold">
                    {t.adm.reports.colSold}
                  </th>
                  <th className="pb-1.5 text-right font-semibold">
                    {t.adm.reports.colRevenue}
                  </th>
                </tr>
              </thead>
              <tbody>
                {top.map((item) => (
                  <tr key={item.name} className="border-t border-hairline">
                    <td className="truncate py-1.5 text-ink">{item.name}</td>
                    <td className="nums py-1.5 text-right text-ink-muted">
                      {item.quantity}
                    </td>
                    <td className="nums py-1.5 text-right font-semibold text-ink">
                      {formatPrice(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {/* 4. Payment methods and order types, as plain tables. */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              {t.adm.reports.paymentSplit}
            </h2>
            <CsvButton
              name="payment-split"
              label={t.adm.reports.paymentSplit}
              rows={(payments ?? []).map((row) => ({
                method: row.method,
                orders: row.count,
                revenue: row.revenue,
              }))}
            />
          </div>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {(payments ?? []).map((row) => (
              <li
                key={row.method}
                className="flex items-center justify-between gap-3 border-b border-hairline pb-1.5 last:border-0"
              >
                <span className="text-ink-muted">
                  {row.method === "CASH"
                    ? t.track.methodCash
                    : row.method === "ONLINE_CARD"
                      ? t.track.methodCard
                      : t.track.methodUpi}
                </span>
                <span className="nums text-ink">
                  {row.count} · {formatPrice(row.revenue)}
                </span>
              </li>
            ))}
            {(payments ?? []).length === 0 && (
              <li className="text-ink-muted">{t.adm.reports.noData}</li>
            )}
          </ul>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">
              {t.adm.reports.orderTypeSplit}
            </h2>
            <CsvButton
              name="order-types"
              label={t.adm.reports.orderTypeSplit}
              rows={(types ?? []).map((row) => ({
                type: row.orderType,
                orders: row.count,
                revenue: row.revenue,
              }))}
            />
          </div>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {(types ?? []).map((row) => (
              <li
                key={row.orderType}
                className="flex items-center justify-between gap-3 border-b border-hairline pb-1.5 last:border-0"
              >
                <span className="text-ink-muted">
                  {row.orderType === "TAKEAWAY"
                    ? t.orderType.takeaway
                    : t.orderType.dineIn}
                </span>
                <span className="nums text-ink">
                  {row.count} · {formatPrice(row.revenue)}
                </span>
              </li>
            ))}
            {(types ?? []).length === 0 && (
              <li className="text-ink-muted">{t.adm.reports.noData}</li>
            )}
          </ul>
        </Card>

        {/* 5. Promised vs actual. */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">{t.adm.reports.prepTime}</h2>
            <CsvButton
              name="prep-time"
              label={t.adm.reports.prepTime}
              rows={
                prep
                  ? [
                      {
                        promisedMinutes: prep.averagePromisedMinutes,
                        actualMinutes: prep.averageActualMinutes,
                        onTimePercent: prep.onTimePercent,
                        sampleSize: prep.sampleSize,
                      },
                    ]
                  : []
              }
            />
          </div>

          <p className="nums mt-3 text-3xl font-bold text-ink">
            {prep?.onTimePercent ?? 0}%
          </p>
          <p className="mt-1 text-xs text-ink-muted">{t.adm.reports.onTime}</p>

          <dl className="mt-3 grid gap-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t.adm.reports.promised}</dt>
              <dd className="nums text-ink">{prep?.averagePromisedMinutes ?? 0} min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">{t.adm.reports.actual}</dt>
              <dd className="nums text-ink">{prep?.averageActualMinutes ?? 0} min</dd>
            </div>
          </dl>
          <Badge variant="muted" className="mt-2">
            {t.adm.dashboard.onTimeSample(prep?.sampleSize ?? 0)}
          </Badge>
        </Card>
      </div>
    </>
  );
}

export default function AdminReportsPage() {
  return (
    <RequireAdmin permission="REPORTS">
      <ReportsModule />
    </RequireAdmin>
  );
}
