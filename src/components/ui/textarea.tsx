import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-control border border-hairline bg-surface px-3 py-2 text-base text-ink",
        "transition-colors outline-none",
        "placeholder:text-ink-muted/70",
        "focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25",
        "disabled:cursor-not-allowed disabled:bg-sand-50 disabled:text-ink-muted disabled:opacity-70",
        "aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
