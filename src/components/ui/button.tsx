import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/*
  Quick Bites button. Restyled from the shadcn default: taller touch targets,
  6px control radius, solid brand fills (no opacity tricks), borders instead of
  shadows, and a brand-coloured focus ring. Variant/size keys are kept so the
  generated Radix primitives that consume `buttonVariants` still work.
*/
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2",
    "rounded-control border border-transparent bg-clip-padding",
    "font-medium whitespace-nowrap select-none",
    "transition-colors duration-150 ease-out outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45",
    "aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/25",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-5",
  ],
  {
    variants: {
      variant: {
        /** Primary call to action — "Add to cart", "Place order". */
        default: "bg-brand text-white hover:bg-brand-hover active:bg-brand-hover",
        /** Mustard band CTAs on combo/deal sections. */
        mustard:
          "bg-mustard font-semibold text-ink hover:bg-[#e0a600] active:bg-[#d49e00]",
        outline:
          "border-hairline bg-surface text-ink hover:bg-sand-50 aria-expanded:bg-sand-50",
        secondary: "bg-sand-100 text-ink hover:bg-sand-200 aria-expanded:bg-sand-200",
        ghost: "text-ink hover:bg-sand-100 aria-expanded:bg-sand-100",
        /** Destructive is solid — cancel order, delete item. */
        destructive: "bg-danger text-white hover:bg-[#a71f1f] active:bg-[#951c1c]",
        /** Low-emphasis destructive, for menu rows and icon buttons. */
        "destructive-ghost": "text-danger hover:bg-danger/10 focus-visible:ring-danger",
        link: "text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand",
      },
      size: {
        /** 40px — the standard control height across the app. */
        default: "h-10 px-4 text-sm",
        /** 48px — hero and sticky-cart CTAs, comfortable on mobile. */
        lg: "h-12 px-6 text-base",
        sm: "h-8 gap-1.5 px-3 text-[0.8125rem] [&_svg:not([class*='size-'])]:size-4",
        xs: "h-7 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-4",
        icon: "size-10",
        "icon-lg": "size-12",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
