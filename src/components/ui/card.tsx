import { cn } from "@/lib/utils";

/*
  Surface container. Separation comes from a hairline border rather than a
  shadow stack — the brief allows exactly one subtle elevation level, which is
  reserved for popovers and sheets.
*/

export interface CardProps extends React.ComponentProps<"div"> {
  /** `raised` adds the single allowed shadow, for cards that float over photos. */
  variant?: "default" | "raised" | "ghost";
  /** Removes padding so media can sit flush to the card edge. */
  flush?: boolean;
}

export function Card({
  className,
  variant = "default",
  flush = false,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-card bg-surface",
        variant !== "ghost" && "border border-hairline",
        variant === "raised" && "shadow-card",
        flush && "overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1 p-5 pb-0", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-base font-semibold text-ink", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-ink-muted", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-3 border-t border-hairline bg-sand-50 px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}
