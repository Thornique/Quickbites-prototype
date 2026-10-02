"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  /** Already formatted — the caller knows whether it is money or a count. */
  value: string | number;
  /** Percentage change against the previous period. */
  delta?: number;
  deltaLabel?: string;
  /** Raw series for the sparkline; drawn only when there are three or more. */
  series?: number[];
  icon?: LucideIcon;
  /** Turns the whole card into a link to the screen that can act on it. */
  href?: string;
  /** Draws attention when the number means somebody must do something. */
  tone?: "default" | "warning" | "danger";
  isLoading?: boolean;
  className?: string;
}

/**
 * Sparkline as an inline SVG path.
 *
 * A charting library for a 60×20 trend line would ship more code than the
 * whole dashboard; this is a polyline over a normalised series.
 */
function Sparkline({ series, tone }: { series: number[]; tone: StatCardProps["tone"] }) {
  const width = 64;
  const height = 22;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;

  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          tone === "danger"
            ? "stroke-danger"
            : tone === "warning"
              ? "stroke-warning"
              : "stroke-brand",
        )}
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  series,
  icon: Icon,
  href,
  tone = "default",
  isLoading = false,
  className,
}: StatCardProps) {
  const isUp = (delta ?? 0) >= 0;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {label}
        </p>
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className={cn(
              "shrink-0",
              tone === "danger"
                ? "text-danger"
                : tone === "warning"
                  ? "text-warning-dark"
                  : "text-ink-muted/70",
            )}
          />
        )}
      </div>

      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <p
          className={cn(
            "nums mt-1.5 text-2xl font-bold tracking-tight",
            tone === "danger"
              ? "text-danger"
              : tone === "warning"
                ? "text-warning-dark"
                : "text-ink",
          )}
        >
          {value}
        </p>
      )}

      <div className="mt-2 flex items-end justify-between gap-3">
        {delta === undefined ? (
          <span />
        ) : (
          <span
            className={cn(
              "nums inline-flex items-center gap-0.5 text-xs font-semibold",
              isUp ? "text-veg-dark" : "text-danger",
            )}
          >
            {isUp ? (
              <ArrowUpRight size={13} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={13} aria-hidden="true" />
            )}
            {Math.abs(delta)}%
            {deltaLabel && (
              <span className="font-normal text-ink-muted"> {deltaLabel}</span>
            )}
          </span>
        )}
        {series && series.length > 2 && <Sparkline series={series} tone={tone} />}
      </div>
    </>
  );

  const cardClass = cn(
    "p-4",
    tone === "warning" && "border-warning/30 bg-warning/5",
    tone === "danger" && "border-danger/30 bg-danger/5",
    href && "transition-colors hover:border-brand/40",
    className,
  );

  // A clickable KPI is a link, not a card with a click handler, so it can be
  // opened in a new tab and reached by keyboard like any other link.
  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "block rounded-card border border-hairline bg-surface",
          "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
          cardClass,
        )}
      >
        {body}
      </Link>
    );
  }

  return <Card className={cardClass}>{body}</Card>;
}
