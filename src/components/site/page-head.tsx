import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export interface PageHeadProps {
  title: string;
  /** One line under the title — the payment note, the pickup rule, and so on. */
  subtitle?: string;
  /**
   * Anything that belongs to the head rather than the page: a closed-store
   * notice, the menu's search and filter toolbar.
   */
  children?: React.ReactNode;
  className?: string;
}

/**
 * The white band every ordering screen opens with.
 *
 * It runs edge to edge and carries the rule, so the content below reads as
 * sitting on the cream page rather than floating in it — the same banding the
 * home sections use, which is what keeps the screens looking like one site.
 */
export function PageHead({ title, subtitle, children, className }: PageHeadProps) {
  return (
    <div className={cn("border-b border-hairline bg-surface", className)}>
      <Container className="py-6 sm:py-9">
        <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>}
        {children}
      </Container>
    </div>
  );
}
