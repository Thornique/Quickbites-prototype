"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Star } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RequireAdmin } from "@/features/auth";
import { useReviews } from "@/features/reviews";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { replyToReview, setReviewApproval } from "@/services/reviews";
import type { Review } from "@/types";
import { cn } from "@/lib/utils";

const ALL = "ALL";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={13}
          strokeWidth={1.75}
          aria-hidden="true"
          className={cn(
            star <= rating ? "fill-mustard text-mustard" : "fill-transparent text-hairline",
          )}
        />
      ))}
    </span>
  );
}

function ReviewsModule() {
  const t = useT();
  // Unapproved reviews are the whole point of this screen, so read them all.
  const { data: reviews, isLoading } = useReviews(false);
  const [rating, setRating] = useState<string>(ALL);
  const [replying, setReplying] = useState<Review | null>(null);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (replying) setReply(replying.reply ?? "");
  }, [replying]);

  const rows = useMemo(
    () =>
      (reviews ?? []).filter(
        (review) => rating === ALL || review.rating === Number(rating),
      ),
    [reviews, rating],
  );

  const toggleApproval = (review: Review, approved: boolean) => {
    void setReviewApproval(review.id, approved)
      .then(() =>
        toast.success(approved ? t.adm.reviews.approved : t.adm.reviews.hidden),
      )
      .catch((error) => toast.error(toErrorMessage(error)));
  };

  const columns: AdminColumn<Review>[] = [
    {
      id: "customer",
      header: t.adm.reviews.colCustomer,
      sortValue: (row) => row.customerName,
      searchValue: (row) => `${row.customerName} ${row.comment}`,
      cell: (row) => (
        <span className="block min-w-0">
          <span className="truncate font-medium text-ink">{row.customerName}</span>
          <span className="nums block text-xs text-ink-muted">
            {formatDate(row.createdAt)}
          </span>
        </span>
      ),
    },
    {
      id: "rating",
      header: t.adm.reviews.colRating,
      sortValue: (row) => row.rating,
      cell: (row) => <Stars rating={row.rating} />,
    },
    {
      id: "comment",
      header: t.adm.reviews.colComment,
      cell: (row) => (
        <span className="block min-w-0">
          <span className="block max-w-md truncate text-ink">{row.comment}</span>
          {row.reply && (
            <span className="mt-0.5 block max-w-md truncate text-xs text-brand">
              ↳ {row.reply}
            </span>
          )}
        </span>
      ),
    },
    {
      id: "status",
      header: t.adm.common.status,
      sortValue: (row) => (row.isApproved ? 1 : 0),
      cell: (row) => (
        <Badge variant={row.isApproved ? "veg" : "warning"}>
          {row.isApproved ? t.adm.reviews.published : t.adm.reviews.pending}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      interactive: true,
      className: "w-44",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button size="xs" variant="outline" onClick={() => setReplying(row)}>
            {t.adm.reviews.reply}
          </Button>
          {row.isApproved ? (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => toggleApproval(row, false)}
            >
              <EyeOff aria-hidden="true" />
              {t.adm.reviews.hide}
            </Button>
          ) : (
            <Button size="xs" onClick={() => toggleApproval(row, true)}>
              <Eye aria-hidden="true" />
              {t.adm.reviews.approve}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={t.adm.reviews.title} description={t.adm.reviews.subtitle} />

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        searchPlaceholder={t.adm.reviews.colComment}
        csvName="reviews"
        emptyTitle={t.adm.reviews.noReviews}
        filters={
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger
              size="sm"
              aria-label={t.adm.reviews.filterRating}
              className="w-36"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t.adm.reviews.allRatings}</SelectItem>
              {[5, 4, 3, 2, 1].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {t.adm.reviews.stars(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        toCsvRow={(row) => ({
          customer: row.customerName,
          rating: row.rating,
          comment: row.comment,
          reply: row.reply ?? "",
          approved: row.isApproved ? "yes" : "no",
          date: formatDate(row.createdAt),
        })}
        renderCard={(row) => (
          <Card className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{row.customerName}</p>
                <Stars rating={row.rating} />
              </div>
              <Badge variant={row.isApproved ? "veg" : "warning"}>
                {row.isApproved ? t.adm.reviews.published : t.adm.reviews.pending}
              </Badge>
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs text-ink-muted">{row.comment}</p>
          </Card>
        )}
      />

      <ConfirmDialog
        open={!!replying}
        onOpenChange={(open) => !open && setReplying(null)}
        title={t.adm.reviews.replyTitle}
        description={t.adm.reviews.replyBody}
        confirmLabel={t.adm.reviews.reply}
        isConfirmDisabled={reply.trim().length === 0}
        successMessage={t.adm.reviews.replied}
        onConfirm={async () => {
          if (replying) await replyToReview(replying.id, reply);
          setReplying(null);
        }}
      >
        <div className="grid gap-3">
          {replying && (
            <Card className="p-3">
              <Stars rating={replying.rating} />
              <p className="mt-1 text-sm text-ink">{replying.comment}</p>
            </Card>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="review-reply">{t.adm.reviews.reply}</Label>
            <Textarea
              id="review-reply"
              rows={3}
              value={reply}
              placeholder={t.adm.reviews.replyPlaceholder}
              onChange={(event) => setReply(event.target.value)}
            />
          </div>
        </div>
      </ConfirmDialog>
    </>
  );
}

export default function AdminReviewsPage() {
  return (
    <RequireAdmin permission="CONTENT">
      <ReviewsModule />
    </RequireAdmin>
  );
}
