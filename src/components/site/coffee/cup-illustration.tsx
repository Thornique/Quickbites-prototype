import { cn } from "@/lib/utils";

/**
 * A takeaway cup, drawn here rather than downloaded.
 *
 * Empty states on the coffee side get this instead of the shared lucide
 * glyph: an outline cup with a little steam is warmer than a crossed-out
 * basket, and an inline SVG costs nothing and inherits `currentColor`, so it
 * themes itself in both light and dark.
 */
export function CupIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className={cn("size-20 text-brand", className)}
    >
      {/* Steam */}
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45">
        <path d="M38 23c0-5 4-5 4-10s-4-5-4-9" />
        <path d="M50 23c0-4 3.5-4.5 3.5-8.5S50 10 50 6.5" />
        <path d="M62 23c0-5 4-5 4-10" />
      </g>

      {/* Lid */}
      <rect
        x="20"
        y="30"
        width="56"
        height="11"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Tapered cup body */}
      <path
        d="M26 45h44l-5 36a6 6 0 0 1-6 5.2H37a6 6 0 0 1-6-5.2L26 45Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Sleeve */}
      <path
        d="M29.6 59h36.8l-1.6 13H31.2l-1.6-13Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}
