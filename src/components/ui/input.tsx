import * as React from "react";
import { cn } from "@/lib/utils";

/*
  40px tall, 6px radius, white surface on the cream page so fields read as
  "fillable". Text stays 16px on mobile to stop iOS zooming on focus.
*/
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-control border border-hairline bg-surface px-3 py-2 text-base text-ink",
        "transition-colors outline-none",
        "placeholder:text-ink-muted/70",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
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

export { Input };
