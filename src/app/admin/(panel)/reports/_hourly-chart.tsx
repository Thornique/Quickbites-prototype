"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_PROPS, CHART_COLORS, TOOLTIP_STYLE } from "@/components/admin/chart-card";

export interface HourRow {
  hour: string;
  orders: number;
}

/**
 * Orders-by-hour bars — the only recharts figure on the reports page.
 *
 * It lives in its own file so the page can pull it in with next/dynamic:
 * recharts is the single biggest import here, and the five tables above it are
 * what somebody reads first.
 */
export function HourlyOrdersChart({ rows }: { rows: HourRow[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
        <XAxis dataKey="hour" {...AXIS_PROPS} interval={1} />
        <YAxis {...AXIS_PROPS} width={36} allowDecimals={false} />
        <Tooltip {...TOOLTIP_STYLE} />
        <Bar dataKey="orders" fill={CHART_COLORS.brand} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
