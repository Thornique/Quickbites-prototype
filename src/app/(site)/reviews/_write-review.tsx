"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth";
import { useOutletId } from "@/features/outlet";
import { useRateableOrders } from "@/features/reviews";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { createReview } from "@/services/reviews";

/**
 * Submission box under the reviews list.
 *
 * Signed-out readers are asked to sign in; signed-in customers who have
 * actually collected an order may write, and the review is tied to that order
 * so the admin can see it was a real visit.
 */
export function WriteReview() {
  const t = useT();
  const { user, isReady } = useSession();
  const outletId = useOutletId();
  const { data: rateable } = useRateableOrders();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isReady) return null;

  if (!user) {
    return (
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-ink">{t.reviewsPage.writeTitle}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t.reviewsPage.signInToWrite}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/login?next=/reviews">{t.account.signIn}</Link>
        </Button>
      </Card>
    );
  }

  if (isDone) {
    return (
      <Card className="border-veg/25 bg-veg/5 p-5">
        <p className="text-sm font-semibold text-ink">{t.reviewsPage.alreadySaid}</p>
        <p className="mt-1 text-sm text-ink-muted">{t.reviewsPage.writeBody}</p>
      </Card>
    );
  }

  const orderId = rateable?.[0]?.id;

  if (rateable && rateable.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-ink">{t.reviewsPage.writeTitle}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t.reviewsPage.orderToWrite}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/menu">{t.cartPage.browseMenu}</Link>
        </Button>
      </Card>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    try {
      await createReview({
        outletId,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        comment: comment.trim(),
        orderId,
      });
      setIsDone(true);
      toast.success(t.orders.rated);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-ink">{t.reviewsPage.writeTitle}</h2>
      <p className="mt-1 text-sm text-ink-muted">{t.reviewsPage.writeBody}</p>

      <form onSubmit={submit} className="mt-4 grid gap-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={t.orders.stars(star)}
              aria-pressed={rating === star}
              className="rounded-control p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand motion-reduce:hover:scale-100"
            >
              <Star
                size={28}
                strokeWidth={1.5}
                aria-hidden="true"
                className={cn(
                  star <= rating ? "fill-mustard text-mustard" : "text-hairline",
                )}
              />
            </button>
          ))}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="review-text">{t.orders.rateComment}</Label>
          <Textarea
            id="review-text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            maxLength={300}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isSending || comment.trim().length === 0}
          className="justify-self-start"
        >
          {t.orders.rateSubmit}
        </Button>
      </form>
    </Card>
  );
}
