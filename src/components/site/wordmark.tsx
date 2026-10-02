import { cn } from "@/lib/utils";

export interface WordmarkProps {
  className?: string;
  /** `stacked` is the two-line lockup used in the footer. */
  variant?: "inline" | "stacked";
  /** Renders in white for dark surfaces. */
  tone?: "brand" | "light";
}

/**
 * "QUICK BITES" wordmark.
 *
 * Drawn as text inside an SVG rather than outlined paths, so it stays a single
 * source of truth with the Archivo webfont the rest of the site loads and
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
}: WordmarkProps) {
  const fill = tone === "light" ? "#FFFFFF" : "var(--color-brand)";

  const textProps = {
    fill,
    fontFamily: "var(--font-archivo), sans-serif",
    fontWeight: 800,
    lengthAdjust: "spacingAndGlyphs" as const,
    style: { fontVariationSettings: '"wdth" 75' },
  };

  if (variant === "stacked") {
    return (
      <svg
        viewBox="0 0 104 54"
        role="img"
        aria-label="Quick Bites"
        className={cn("h-12 w-auto", className)}
      >
        <text {...textProps} x="0" y="22" fontSize="26" textLength="86">
          QUICK
        </text>
        <text {...textProps} x="0" y="48" fontSize="26" textLength="86">
          BITES
        </text>
        <circle cx="96" cy="43" r="5" fill="var(--color-mustard)" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 160 26"
      role="img"
      aria-label="Quick Bites"
      className={cn("h-6 w-auto", className)}
    >
      <text {...textProps} x="0" y="21" fontSize="26" textLength="146">
        QUICK BITES
      </text>
      {/* A bite taken out of the full stop — the only flourish in the mark. */}
      <circle cx="154" cy="19" r="4.5" fill="var(--color-mustard)" />
    </svg>
  );
}
