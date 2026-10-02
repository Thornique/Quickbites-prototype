"use client";

import { MessageSquareQuote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useRatingSummary, useReviews } from "@/features/reviews";
import { useT } from "@/i18n";
import { formatDate } from "@/lib/format";
import { Stars } from "./_stars";
import { WriteReview } from "./_write-review";

export function ReviewsContent() {
  const t = useT();
  const { data: summary, isLoading: isSummaryLoading } = useRatingSummary();
  const { data: reviews, isLoading } = useReviews();

  const total = summary?.total ?? 0;

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow={t.reviewsPage.eyebrow}
        title={t.reviewsPage.title}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-10">
        {/* Average + distribution */}
        <div>
          <Card className="p-5">
            {isSummaryLoading || !summary ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex items-end gap-3">
                  <p className="nums text-display text-5xl text-ink">
                    {summary.average.toFixed(1)}
                  </p>
                  <div className="pb-1.5">
                    <p className="text-sm text-ink-muted">{t.reviewsPage.outOf}</p>
                    <Stars rating={summary.average} size={18} className="mt-0.5" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  {t.reviewsPage.fromCount(summary.total)}
                </p>

                <h2 className="mt-5 text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
                  {t.reviewsPage.distribution}
                </h2>
                <ul className="mt-3 grid gap-2">
                  {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = summary.distribution[star];
                    const percent = total === 0 ? 0 : Math.round((count / total) * 100);
                    return (
                      <li key={star} className="flex items-center gap-3">
                        <span className="nums w-3 text-sm text-ink-muted">{star}</span>
                        <span
                          className="h-2.5 flex-1 overflow-hidden rounded-pill bg-sand-100"
                          role="img"
                          aria-label={t.reviewsPage.starBar(star, count)}
                        >
                          <span
                            className="block h-full rounded-pill bg-mustard"
                            style={{ width: `${percent}%` }}
                          />
                        </span>
                        <span className="nums w-8 text-right text-sm text-ink-muted">
                          {count}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Card>

          <div className="mt-5">
            <WriteReview />
          </div>
        </div>

        {/* The reviews themselves */}
        <div>
          {isLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-card" />
              ))}
            </div>
          )}

          {!isLoading && (reviews ?? []).length === 0 && (
            <EmptyState
              icon={MessageSquareQuote}
              title={t.reviewsPage.empty}
              description={t.reviewsPage.emptyBody}
            />
          )}

          <ul className="grid gap-3">
            {(reviews ?? []).map((review) => (
              <li key={review.id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {review.customerName}
                    </p>
                    <p className="nums text-xs text-ink-muted">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <Stars rating={review.rating} className="mt-1.5" />
                  <p className="mt-2.5 text-sm leading-relaxed text-ink">
                    {review.comment}
                  </p>

                  {review.reply && (
                    <div className="mt-4 border-l-2 border-brand/30 pl-4">
                      <p className="text-xs font-bold tracking-wide text-brand uppercase">
                        {t.reviewsPage.ownerReply}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                        {review.reply}
                      </p>
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
