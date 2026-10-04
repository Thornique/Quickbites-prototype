"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_PROPS,
  CHART_COLORS,
  ChartCard,
  TOOLTIP_STYLE,
} from "@/components/admin/chart-card";
import { resolvePreset } from "@/components/admin/date-range-picker";
import { Badge } from "@/components/ui/badge";
import {
  useItemPerformance,
  useOrderTypeSplit,
  useOrdersByHour,
  usePaymentSplit,
  usePrepTimeAccuracy,
  useReportScope,
  useRevenueByDay,
} from "@/features/reports";
import { useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import type { DateRange } from "@/services/reports";

/** "2026-10-02" → "2 Oct", for a 30-point axis that must stay readable. */
function shortDate(key: string): string {
  const date = new Date(`${key}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** "14" → "2 PM". */
function hourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function RevenueChart({ range }: { range: DateRange }) {
  const t = useT();
  const { data, isLoading } = useRevenueByDay(useReportScope(range));
  const rows = (data ?? []).map((day) => ({ ...day, label: shortDate(day.date) }));

  return (
    <ChartCard
      title={t.adm.dashboard.revenue30}
      isLoading={isLoading}
      isEmpty={rows.every((row) => row.revenue === 0)}
      className="xl:col-span-2"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.18} />
              <stop offset="100%" stopColor={CHART_COLORS.brand} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            {...AXIS_PROPS}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            {...AXIS_PROPS}
            width={52}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value) => [
              formatPrice(Number(value)),
              t.adm.dashboard.todayRevenue,
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={CHART_COLORS.brand}
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/**
 * Today's trade against the 30-day average for the same hour, so a quiet
 * afternoon is distinguishable from an unusually quiet one.
 */
export function OrdersByHourChart() {
  const t = useT();
  const today = useMemo(() => resolvePreset("today"), []);
  const month = useMemo(() => resolvePreset("last30"), []);
  const { data: todayHours, isLoading } = useOrdersByHour(useReportScope(today));
  const { data: monthHours } = useOrdersByHour(useReportScope(month));

  const rows = (todayHours ?? []).map((count, hour) => ({
    hour: hourLabel(hour),
    today: count,
    average: Math.round(((monthHours?.[hour] ?? 0) / 30) * 10) / 10,
  }));

  // The cafe opens at 10 and closes at 23; the dead hours are noise.
  const trading = rows.slice(9, 24);

  return (
    <ChartCard
      title={t.adm.dashboard.ordersByHour}
      isLoading={isLoading}
      isEmpty={trading.every((row) => row.today === 0 && row.average === 0)}
      legend={
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-sm"
              style={{ background: CHART_COLORS.brand }}
            />
            {t.adm.dashboard.ordersByHourToday}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-sm"
              style={{ background: CHART_COLORS.grid }}
            />
            {t.adm.dashboard.ordersByHourAverage}
          </span>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trading} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
          <XAxis dataKey="hour" {...AXIS_PROPS} interval={1} />
          <YAxis {...AXIS_PROPS} width={40} allowDecimals={false} />
          <Tooltip {...TOOLTIP_STYLE} />
          <Bar dataKey="average" fill={CHART_COLORS.grid} radius={[3, 3, 0, 0]} />
          <Bar dataKey="today" fill={CHART_COLORS.brand} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopItemsChart({ range }: { range: DateRange }) {
  const t = useT();
  const { data, isLoading } = useItemPerformance(useReportScope(range));
  const rows = (data ?? []).slice(0, 5).map((item) => ({
    name: item.name.length > 18 ? `${item.name.slice(0, 17)}…` : item.name,
    revenue: item.revenue,
  }));

  return (
    <ChartCard
      title={t.adm.dashboard.topItems}
      isLoading={isLoading}
      isEmpty={rows.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 0, right: 8, bottom: 0, left: 8 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            {...AXIS_PROPS}
            width={110}
            tickMargin={4}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value) => formatPrice(Number(value))}
          />
          <Bar dataKey="revenue" fill={CHART_COLORS.mustard} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/** Two small donuts: how people ate, and how they paid. */
function SplitDonut({
  title,
  rows,
  isLoading,
}: {
  title: string;
  rows: Array<{ label: string; value: number; color: string }>;
  isLoading: boolean;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <ChartCard title={title} isLoading={isLoading} isEmpty={total === 0} height={180}>
      <div className="flex h-full items-center gap-2">
        <div className="h-full w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="value"
                nameKey="label"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="none"
              >
                {rows.map((row) => (
                  <Cell key={row.label} fill={row.color} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* A legend with the numbers, since a donut alone cannot be read. */}
        <ul className="grid min-w-0 flex-1 gap-1.5">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: row.color }}
              />
              <span className="min-w-0 flex-1 truncate text-ink-muted">
                {row.label}
              </span>
              <span className="nums font-semibold text-ink">{row.value}</span>
              <span className="nums w-10 text-right text-ink-muted">
                {total === 0 ? "0%" : `${Math.round((row.value / total) * 100)}%`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}

export function OrderTypeSplitChart({ range }: { range: DateRange }) {
  const t = useT();
  const { data, isLoading } = useOrderTypeSplit(useReportScope(range));

  const rows = (data ?? []).map((row) => ({
    label: row.orderType === "TAKEAWAY" ? t.orderType.takeaway : t.orderType.dineIn,
    value: row.count,
    color: row.orderType === "TAKEAWAY" ? CHART_COLORS.brand : CHART_COLORS.teal,
  }));

  return (
    <SplitDonut
      title={t.adm.dashboard.orderTypeSplit}
      rows={rows}
      isLoading={isLoading}
    />
  );
}

export function PaymentSplitChart({ range }: { range: DateRange }) {
  const t = useT();
  const { data, isLoading } = usePaymentSplit(useReportScope(range));

  const colors = {
    ONLINE_UPI: CHART_COLORS.brand,
    ONLINE_CARD: CHART_COLORS.teal,
    CASH: CHART_COLORS.mustard,
  };
  const labels = {
    ONLINE_UPI: t.track.methodUpi,
    ONLINE_CARD: t.track.methodCard,
    CASH: t.track.methodCash,
  };

  const rows = (data ?? []).map((row) => ({
    label: labels[row.method],
    value: row.count,
    color: colors[row.method],
  }));

  return (
    <SplitDonut
      title={t.adm.dashboard.paymentSplit}
      rows={rows}
      isLoading={isLoading}
    />
  );
}

/** Promised vs actual: the one number that says whether the board is honest. */
export function OnTimeCard({ range }: { range: DateRange }) {
  const t = useT();
  const { data, isLoading } = usePrepTimeAccuracy(useReportScope(range));
  const percent = data?.onTimePercent ?? 0;

  return (
    <ChartCard
      title={t.adm.dashboard.onTime}
      isLoading={isLoading}
      isEmpty={(data?.sampleSize ?? 0) === 0}
      height={180}
    >
      <div className="flex h-full flex-col justify-center">
        <p className="nums text-4xl font-bold tracking-tight text-ink">{percent}%</p>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-pill bg-sand-100"
          role="img"
          aria-label={`${percent}%`}
        >
          <div
            className={
              percent >= 80
                ? "h-full rounded-pill bg-veg"
                : percent >= 60
                  ? "h-full rounded-pill bg-mustard"
                  : "h-full rounded-pill bg-danger"
            }
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          {t.adm.dashboard.onTimeBody(
            data?.averagePromisedMinutes ?? 0,
            data?.averageActualMinutes ?? 0,
          )}
        </p>
        <Badge variant="muted" className="mt-2 w-fit">
          {t.adm.dashboard.onTimeSample(data?.sampleSize ?? 0)}
        </Badge>
      </div>
    </ChartCard>
  );
}
