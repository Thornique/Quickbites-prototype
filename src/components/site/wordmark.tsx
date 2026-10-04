import { cn } from "@/lib/utils";
import type { OutletId } from "@/types";

export interface WordmarkProps {
  className?: string;
  /** `stacked` is the two-line lockup used in the footer. */
  variant?: "inline" | "stacked";
  /** Renders in white for dark surfaces. */
  tone?: "brand" | "light";
  /**
   * Which outlet's lockup to draw. Defaults to the restaurant so server-
   * rendered chrome has something to paint before the choice is read.
   */
  outletId?: OutletId;
}

/**
 * "QUICK BITES" / "QUICK BITES COFFEE" wordmark.
 *
 * Drawn as text inside an SVG rather than outlined paths, so it stays a single
 * source of truth with the display webfont the rest of the site loads and
 * remains readable by assistive tech.
 *
 * `textLength` pins each line to an exact width. Without it the lockup depends
 * on font metrics, so the mustard dot drifted away from the final "S" while
 * the webfont loaded and never fully closed up afterwards.
 */
export function Wordmark({
  className,
  variant = "inline",
  tone = "brand",
  outletId = "restaurant",
}: WordmarkProps) {
  const fill = tone === "light" ? "#FFFFFF" : "var(--color-brand)";
  const isCoffee = outletId === "coffee";
  const label = isCoffee ? "Quick Bites Coffee" : "Quick Bites";

  const textProps = {
    fill,
    fontFamily: "var(--font-display-face), sans-serif",
    fontWeight: 800,
    lengthAdjust: "spacingAndGlyphs" as const,
  };

  if (variant === "stacked") {
    return (
      <svg
        viewBox="0 0 104 54"
        role="img"
        aria-label={label}
        className={cn("h-12 w-auto", className)}
      >
        <text {...textProps} x="0" y="22" fontSize="26" textLength="86">
          QUICK
        </text>
        <text {...textProps} x="0" y="48" fontSize="26" textLength="86">
          BITES
        </text>
        {isCoffee ? (
          /* The sub-line replaces the dot: a bite mark on a coffee cup reads
             as a mistake, and the word is what distinguishes the outlet. */
          <text
            {...textProps}
            x="0"
            y="54"
            fontSize="9"
            textLength="86"
            letterSpacing="0.14em"
          >
            COFFEE
          </text>
        ) : (
          <circle cx="96" cy="43" r="5" fill="var(--color-mustard)" />
        )}
      </svg>
    );
  }

  if (isCoffee) {
    return (
      <svg
        viewBox="0 0 268 26"
        role="img"
        aria-label={label}
        className={cn("h-6 w-auto", className)}
      >
        <text {...textProps} x="0" y="21" fontSize="26" textLength="166">
          QUICK BITES
        </text>
        <text
          {...textProps}
          x="176"
          y="21"
          fontSize="26"
          textLength="92"
          fill={tone === "light" ? "#FFFFFF" : "var(--color-caramel-dark)"}
        >
          COFFEE
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 182 26"
      role="img"
      aria-label={label}
      className={cn("h-6 w-auto", className)}
    >
      <text {...textProps} x="0" y="21" fontSize="26" textLength="166">
        QUICK BITES
      </text>
      {/* A bite taken out of the full stop — the only flourish in the mark. */}
      <circle cx="176" cy="19" r="4.5" fill="var(--color-mustard)" />
    </svg>
  );
}
