import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  /**
   * A drawing to use instead of the lucide glyph — the coffee outlet passes
   * its cup. Takes the whole circle rather than sitting inside it, because an
   * illustration boxed in a 48px tinted puck reads as an icon that went wrong.
   */
  illustration?: React.ReactNode;
  title: string;
  description?: string;
  /** Every empty state should offer the obvious next action. */
  action?: React.ReactNode;
  /** `inline` for empty table bodies, `panel` for empty pages. */
  variant?: "panel" | "inline";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  variant = "panel",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "panel"
          ? "rounded-card border border-dashed border-hairline bg-surface px-6 py-14"
          : "px-4 py-10",
        className,
      )}
    >
      {illustration ? (
        <span className="mb-4 inline-flex">{illustration}</span>
      ) : (
        Icon && (
          <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-sand-100 text-ink-muted">
            <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
          </span>
        )
      )}
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && (
        <p className="measure mt-1.5 text-sm text-ink-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
