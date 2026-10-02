import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
} as const;

export interface PriceProps {
  /** Amount actually charged, in rupees. */
  value: number;
  /** Original price, shown struck through when higher than `value`. */
  compareAt?: number | null;
  size?: keyof typeof SIZE_CLASSES;
  /** Render the discount as a "20% OFF" pill after the prices. */
  showSavingPercent?: boolean;
  className?: string;
}

/**
 * Canonical money display. Always tabular so columns of prices and running
 * totals do not jitter as digits change.
 */
export function Price({
  value,
  compareAt,
  size = "md",
  showSavingPercent = false,
  className,
}: PriceProps) {
  const hasDiscount = typeof compareAt === "number" && compareAt > value;
  const percentOff = hasDiscount
    ? Math.round(((compareAt - value) / compareAt) * 100)
    : 0;

  return (
    <span className={cn("nums inline-flex items-baseline gap-1.5", className)}>
      <span className={cn("font-semibold text-ink", SIZE_CLASSES[size])}>
        {formatPrice(value)}
      </span>

      {hasDiscount && (
        <>
          <span className="text-xs text-ink-muted line-through">
            {formatPrice(compareAt)}
          </span>
          <span className="sr-only">, reduced from {formatPrice(compareAt)}</span>
        </>
      )}

      {hasDiscount && showSavingPercent && percentOff > 0 && (
        <span className="rounded-pill bg-veg/10 px-1.5 py-0.5 text-[0.6875rem] font-bold text-veg-dark">
          {percentOff}% OFF
        </span>
      )}
    </span>
  );
}
