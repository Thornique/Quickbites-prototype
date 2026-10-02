import { cn } from "@/lib/utils";

/** Section wrapper used only by the internal style guide. */
export function Panel({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-hairline pt-10">
      <h2 className="text-display text-2xl text-ink uppercase">{title}</h2>
      {note && <p className="measure mt-1.5 text-sm text-ink-muted">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Labelled row of examples. */
export function Row({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
      <p className="pt-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
        {label}
      </p>
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        {children}
      </div>
    </div>
  );
}
