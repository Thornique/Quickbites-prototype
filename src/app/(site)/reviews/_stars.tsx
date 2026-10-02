"use client";

import { Star } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

/** Read-only star row. The rating is announced once, not five times. */
export function Stars({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const t = useT();

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={t.reviews.ratingOf(rating)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          strokeWidth={1.75}
          aria-hidden="true"
          className={cn(
            star <= Math.round(rating)
              ? "fill-mustard text-mustard"
              : "fill-transparent text-hairline",
          )}
        />
      ))}
    </span>
  );
}
