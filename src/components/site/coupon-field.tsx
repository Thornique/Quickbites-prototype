"use client";

import { useState } from "react";
import { Tag as TagIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOffersForCart } from "@/features/coupons";
import { useOutletId } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { toErrorMessage } from "@/lib/errors";
import { applyCouponCode } from "@/services/coupons";
import { useCart, useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { CouponEvaluation, PricedCartLine } from "@/types";

/**
 * Coupon entry plus the list of running offers.
 *
 * Eligibility and the discount are decided by the coupon service, never here,
 * so what the cart promises is exactly what placeOrder will honour.
 */
export function CouponField({
  lines,
  className,
}: {
  lines: PricedCartLine[];
  className?: string;
}) {
  const t = useT();
  const pick = usePick();
  const outletId = useOutletId();
  const { couponCode } = useCart(outletId);
  const setCoupon = useCartStore((s) => s.setCoupon);

  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { data: offers, isLoading } = useOffersForCart(outletId, lines);

  /** Turns a rejection reason into something a customer can act on. */
  const reasonText = (evaluation: CouponEvaluation): string | null => {
    switch (evaluation.reason) {
      case "MIN_ORDER_NOT_MET":
        return t.coupon.addMore(formatPrice(evaluation.amountNeeded ?? 0));
      case "EXPIRED":
        return t.coupon.expired;
      case "NOT_STARTED":
        return t.coupon.notStarted;
      case "USAGE_LIMIT_REACHED":
        return t.coupon.exhausted;
      case "PER_USER_LIMIT_REACHED":
        return t.coupon.alreadyUsed;
      case "NO_ELIGIBLE_ITEMS":
        return t.coupon.noEligibleItems;
      case "INACTIVE":
      case "NOT_FOUND":
        return t.coupon.invalid;
      default:
        return null;
    }
  };

  const apply = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setIsChecking(true);
    setError(null);
    try {
      const result = await applyCouponCode(outletId, trimmed, lines);
      if (!result.isEligible) {
        setError(reasonText(result) ?? t.coupon.invalid);
        return;
      }
      setCoupon(trimmed);
      setDraft("");
      toast.success(t.coupon.applied(trimmed, formatPrice(result.discount)));
    } catch (caught) {
      setError(toErrorMessage(caught, t.coupon.invalid));
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={className}>
      {couponCode ? (
        <div className="flex items-center gap-3 rounded-control border border-dashed border-veg/40 bg-veg/5 px-3 py-2.5">
          <TagIcon size={16} className="shrink-0 text-veg-dark" aria-hidden="true" />
          <p className="nums flex-1 text-sm font-semibold text-veg-dark">
            {couponCode}
          </p>
          <button
            type="button"
            onClick={() => {
              setCoupon(undefined);
              setError(null);
            }}
            className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-xs font-semibold text-ink-muted transition-colors hover:text-danger focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X size={14} aria-hidden="true" />
            {t.coupon.remove}
          </button>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void apply(draft);
          }}
          className="flex gap-2"
        >
          <Input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value.toUpperCase());
              setError(null);
            }}
            aria-label={t.coupon.label}
            aria-invalid={error ? true : undefined}
            placeholder={t.coupon.placeholder}
            className="nums uppercase"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={isChecking || !draft.trim()}
          >
            {t.coupon.apply}
          </Button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
          {error}
        </p>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t.coupon.available}
        </p>

        {isLoading && <Skeleton className="mt-2 h-16 w-full" />}

        <ul className="mt-2 grid gap-2">
          {offers?.slice(0, 4).map((offer) => {
            const isApplied = couponCode === offer.coupon.code;
            const why = reasonText(offer);
            return (
              <li
                key={offer.coupon.id}
                className={cn(
                  "flex items-start gap-3 rounded-control border px-3 py-2.5",
                  offer.isEligible
                    ? "border-hairline bg-surface"
                    : "border-hairline bg-sand-50",
                )}
              >
                <code className="nums shrink-0 rounded-control border border-dashed border-brand/40 bg-brand/5 px-2 py-1 text-xs font-bold text-brand">
                  {offer.coupon.code}
                </code>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink">{pick(offer.coupon.description)}</p>
                  {!offer.isEligible && why && (
                    <p className="mt-0.5 text-xs text-ink-muted">{why}</p>
                  )}
                </div>
                {offer.isEligible && !isApplied && (
                  <button
                    type="button"
                    onClick={() => void apply(offer.coupon.code)}
                    className="shrink-0 rounded-control px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {t.coupon.apply}
                  </button>
                )}
                {isApplied && (
                  <span className="shrink-0 text-xs font-semibold text-veg-dark">
                    {t.coupon.appliedShort}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
