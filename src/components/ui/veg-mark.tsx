import { cn } from "@/lib/utils";

const SIZES = { sm: 12, md: 16, lg: 20 } as const;

export interface VegMarkProps {
  /** `true` renders the green veg mark, `false` the brown non-veg mark. */
  isVeg: boolean;
  size?: keyof typeof SIZES;
  /** Show the words "Veg" / "Non-veg" next to the mark. */
  withLabel?: boolean;
  className?: string;
}

/**
 * The Indian packaged-food convention: a bordered square containing a filled
 * dot for vegetarian, and a filled triangle for non-vegetarian. Drawn as SVG
 * so it stays crisp at 12px and never depends on an icon font or emoji.
 */
export function VegMark({
  isVeg,
  size = "md",
  withLabel = false,
  className,
}: VegMarkProps) {
  const px = SIZES[size];
  const colour = isVeg ? "var(--color-veg)" : "var(--color-nonveg)";
  const label = isVeg ? "Vegetarian" : "Non-vegetarian";

  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-1.5", className)}
      title={label}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 16 16"
        role="img"
        aria-label={label}
        className="shrink-0"
      >
        <rect
          x="0.75"
          y="0.75"
          width="14.5"
          height="14.5"
          rx="2"
          fill="var(--color-surface)"
          stroke={colour}
          strokeWidth="1.5"
        />
        {isVeg ? (
          <circle cx="8" cy="8" r="3.5" fill={colour} />
        ) : (
          <path d="M8 4.1 L12 11.6 H4 Z" fill={colour} />
        )}
      </svg>
      {withLabel && (
        <span
          className="text-xs font-semibold"
          style={{ color: colour }}
          aria-hidden="true"
        >
          {isVeg ? "Veg" : "Non-veg"}
        </span>
      )}
    </span>
  );
}
