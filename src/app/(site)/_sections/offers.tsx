"use client";

import { Copy, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoupons } from "@/features/coupons";
import { useOutletId } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
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
  const outletId = useOutletId();
  const isCoffee = outletId === "coffee";
  const { data: coupons, isLoading } = useCoupons(outletId, true);

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
    <section id="offers" className="scroll-mt-24 pb-12 sm:pb-16">
      {/*
        The restaurant heads its deals page with a mustard band, the way the
        chains do. Ink on mustard rather than the white those sites use —
        white on this yellow measures about 1.9:1 and the brief asks for AA.

        The coffee shop takes the caramel gradient instead, with cream type:
        the gradient's lightest stop is #A85A26, which carries white at 5:1.
      */}
      <div className={isCoffee ? "coffee-gradient" : "bg-mustard"}>
        <Container className="py-8 text-center sm:py-10">
          <p
            className={cn(
              "coffee-eyebrow",
              isCoffee ? "text-white/75" : "text-ink/70",
            )}
          >
            {t.offers.eyebrow}
          </p>
          <h2
            className={cn(
              "mt-1.5 text-[clamp(1.75rem,5vw,3rem)]",
              isCoffee
                ? "coffee-display text-white"
                : "text-display text-ink uppercase",
            )}
          >
            {t.offers.title}
          </h2>
          <p
            className={cn(
              "mx-auto mt-2 max-w-xl text-sm sm:text-base",
              isCoffee ? "text-white/85" : "text-ink/75",
            )}
          >
            {t.offers.description}
          </p>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-10">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-card" />
            ))}
          </div>
        )}

        {!isLoading && coupons?.length === 0 && (
          <EmptyState
            icon={Ticket}
            title={t.offers.noOffers}
            description={t.offers.noOffersBody}
          />
        )}

        <ul className="grid gap-4 sm:grid-cols-2">
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

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p
                    className={cn(
                      "text-3xl text-brand sm:text-4xl",
                      isCoffee ? "coffee-display" : "text-display uppercase",
                    )}
                  >
                    {headlineOf(coupon)}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    {pick(coupon.description)}
                  </p>
                  <p className="nums mt-1 text-xs text-ink-muted">
                    {t.offers.minOrder(formatPrice(coupon.minOrder))}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-dashed border-hairline pt-4">
                    <code className="nums rounded-control bg-brand/12 px-3 py-1.5 text-sm font-bold tracking-wider text-ink">
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
