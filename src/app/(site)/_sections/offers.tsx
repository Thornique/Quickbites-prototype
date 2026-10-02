"use client";

import { Copy, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoupons } from "@/features/coupons";
import { usePick, useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import type { Coupon } from "@/types";

/** "20% off up to ₹80" / "₹50 off" — the headline figure on the ticket. */
function useOfferHeadline() {
  const t = useT();
  return (coupon: Coupon) => {
    if (coupon.type === "FLAT") return t.offers.offFlat(formatPrice(coupon.value));
    const base = t.offers.offPercent(coupon.value);
    return coupon.maxDiscount
      ? `${base} ${t.offers.upTo(formatPrice(coupon.maxDiscount))}`
      : base;
  };
}

export function Offers() {
  const t = useT();
  const pick = usePick();
  const headlineOf = useOfferHeadline();
  const { data: coupons, isLoading } = useCoupons(true);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(t.offers.copied(code));
    } catch {
      // Clipboard can be blocked; the code is on screen either way.
      toast.error(t.common.somethingWentWrong);
    }
  };

  return (
    <section id="offers" className="scroll-mt-24 py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow={t.offers.eyebrow}
          title={t.offers.title}
          description={t.offers.description}
        />

        {isLoading && (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-card" />
            ))}
          </div>
        )}

        {!isLoading && coupons?.length === 0 && (
          <EmptyState
            className="mt-7"
            icon={Ticket}
            title={t.offers.noOffers}
            description={t.offers.noOffersBody}
          />
        )}

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons?.map((coupon) => (
            <li key={coupon.id}>
              {/*
                Ticket shape: a dashed rule and two notches cut into the sides,
                so it reads as a voucher rather than another rounded card.
              */}
              <div className="relative flex h-full overflow-hidden rounded-card border border-hairline bg-surface">
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full border border-hairline bg-cream"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full border border-hairline bg-cream"
                />

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-display text-2xl text-brand uppercase">
                    {headlineOf(coupon)}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    {pick(coupon.description)}
                  </p>
                  <p className="nums mt-1 text-xs text-ink-muted">
                    {t.offers.minOrder(formatPrice(coupon.minOrder))}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-dashed border-hairline pt-4">
                    <code className="nums rounded-control border border-dashed border-brand/40 bg-brand/5 px-2.5 py-1.5 text-sm font-bold tracking-wider text-brand">
                      {coupon.code}
                    </code>
                    <button
                      type="button"
                      onClick={() => void copy(coupon.code)}
                      className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-sand-50 hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <Copy size={14} strokeWidth={2} aria-hidden="true" />
                      {t.offers.copyCode}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
