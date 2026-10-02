"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Frame for every recharts figure in the panel: title, optional legend slot, a
 * fixed-height plot area and one empty state.
 *
 * Charts live inside a card of a known height because a responsive container
 * with no height collapses to nothing, and an empty chart that still draws its
 * axes reads as broken data rather than no data.
 */
export function ChartCard({
  title,
  description,
  legend,
  isLoading = false,
  isEmpty = false,
  height = 220,
  children,
  className,
}: {
  title: string;
  description?: string;
  legend?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const t = useT();

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
        </div>
        {legend}
      </div>

      <div className="mt-3" style={{ height }}>
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : isEmpty ? (
          <div className="flex h-full items-center justify-center rounded-control border border-dashed border-hairline">
            <p className="text-sm text-ink-muted">{t.adm.dashboard.noChartData}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

/** Shared recharts styling, so every figure reads as part of one dashboard. */
export const CHART_COLORS = {
  brand: "#d7261e",
  mustard: "#f4b400",
  teal: "#2f6f6b",
  ink: "#6b645c",
  grid: "#e8e1d6",
};

export const AXIS_PROPS = {
  stroke: CHART_COLORS.ink,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

/** Tooltip chrome matching our cards rather than recharts' default white box. */
export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid #e8e1d6",
    boxShadow: "0 1px 2px rgb(26 23 20 / 0.06)",
    fontSize: 12,
    padding: "6px 10px",
  },
  labelStyle: { color: "#1a1714", fontWeight: 600, marginBottom: 2 },
} as const;
