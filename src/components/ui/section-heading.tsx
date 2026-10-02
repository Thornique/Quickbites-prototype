import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  /** Short uppercase kicker above the title, e.g. "Most loved". */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned link or button, e.g. "See full menu". */
  action?: React.ReactNode;
  /** `lg` is for page titles, `md` for sections inside a page. */
  size?: "md" | "lg";
  as?: "h1" | "h2" | "h3";
  className?: string;
}

/**
 * Section header in the condensed display face. Keeps the title, optional
 * kicker and an action on one baseline so home/menu sections stay aligned.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  size = "md",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-6 gap-y-3",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-xs font-bold tracking-[0.12em] text-brand uppercase">
            {eyebrow}
          </p>
        )}
        <Heading
          className={cn(
            "text-display text-ink uppercase",
            size === "lg" ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </Heading>
        {description && (
          <p className="measure mt-2 text-sm text-ink-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
