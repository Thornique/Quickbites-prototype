import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/*
  Chips and status pills. Pill radius is intentional here — per the brief it is
  reserved for chips/tags only, never for buttons or cards.
*/
const badgeVariants = cva(
  [
    "inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden",
    "rounded-pill border border-transparent px-2.5 py-0.5",
    "text-xs font-semibold whitespace-nowrap transition-colors",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "[&>svg]:pointer-events-none [&>svg]:size-3.5",
  ],
  {
    variants: {
      variant: {
        default: "bg-brand text-white [a&]:hover:bg-brand-hover",
        mustard: "bg-mustard text-ink [a&]:hover:bg-[#e0a600]",
        secondary: "bg-sand-100 text-ink [a&]:hover:bg-sand-200",
        outline: "border-hairline bg-surface text-ink-muted [a&]:hover:bg-sand-50",
        veg: "bg-veg/10 text-veg",
        nonveg: "bg-nonveg/10 text-nonveg",
        success: "bg-success/10 text-success",
        warning: "bg-warning/12 text-warning",
        danger: "bg-danger/10 text-danger",
        /** Neutral low-emphasis pill for counts and metadata. */
        muted: "bg-sand-100 text-ink-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
