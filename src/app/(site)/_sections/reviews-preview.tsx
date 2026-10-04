"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useOutletId } from "@/features/outlet";
import { useRatingSummary, useReviews } from "@/features/reviews";
import { useT } from "@/i18n";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          strokeWidth={1.75}
          className={star <= rating ? "fill-mustard text-mustard" : "text-hairline"}
        />
      ))}
    </span>
  );
}

export function ReviewsPreview() {
  const t = useT();
  const outletId = useOutletId();
  const { data: reviews, isLoading } = useReviews(outletId, true);
  const { data: summary } = useRatingSummary(outletId);

  const latest = reviews?.slice(0, 3);

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow={t.reviews.eyebrow}
          title={t.reviews.title}
          description={
            summary && summary.total > 0
              ? t.reviews.averageOf(summary.average, summary.total)
              : undefined
          }
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/reviews">{t.reviews.readAll}</Link>
            </Button>
          }
        />

        <ul className="mt-7 grid gap-4 sm:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-40 w-full rounded-card" />
              </li>
            ))}

          {latest?.map((review) => (
            <li key={review.id}>
              <Card className="flex h-full flex-col p-5">
                <Stars rating={review.rating} />
                <span className="sr-only">{t.reviews.ratingOf(review.rating)}</span>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink">
                  “{review.comment}”
                </blockquote>
                <footer className="mt-4 border-t border-hairline pt-3 text-xs text-ink-muted">
                  <span className="font-semibold text-ink">{review.customerName}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="nums">{formatDate(review.createdAt)}</span>
                </footer>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
