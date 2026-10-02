"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { createReview } from "@/services/reviews";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";

/** Star rating plus a comment. The review waits for admin approval. */
export function RateOrderDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const t = useT();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (order) {
      setRating(5);
      setComment("");
    }
  }, [order]);

  const submit = async () => {
    if (!order) return;
    setIsSending(true);
    try {
      await createReview({
        rating: rating as 1 | 2 | 3 | 4 | 5,
        comment: comment.trim() || "Good food, quick service.",
        orderId: order.id,
      });
      toast.success(t.orders.rated);
      onClose();
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.orders.rateTitle}</DialogTitle>
          <DialogDescription>{t.orders.rateBody}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-1 py-2">
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
                size={30}
                strokeWidth={1.5}
                className={cn(
                  star <= rating ? "fill-mustard text-mustard" : "text-hairline",
                )}
              />
            </button>
          ))}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="review-comment">{t.orders.rateComment}</Label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={3}
            maxLength={300}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button disabled={isSending} onClick={() => void submit()}>
            {t.orders.rateSubmit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
