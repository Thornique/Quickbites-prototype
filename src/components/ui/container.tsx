import { cn } from "@/lib/utils";

export interface ContainerProps extends React.ComponentProps<"div"> {
  /** `wide` drops the 1240px cap for full-bleed admin tables. */
  width?: "content" | "wide" | "narrow";
}

const WIDTHS = {
  /** 1240px — the standard site measure from the brief. */
  content: "max-w-[var(--container-content)]",
  wide: "max-w-[1600px]",
  /** Reading measure for legal/about copy. */
  narrow: "max-w-[760px]",
} as const;

/**
 * Horizontal page gutter + max width. 16px gutter on mobile so content never
 * touches the screen edge, widening on larger viewports.
 */
export function Container({ className, width = "content", ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", WIDTHS[width], className)}
      {...props}
    />
  );
}
