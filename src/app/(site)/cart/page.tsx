"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartLineRow } from "@/components/site/cart-line-row";
import { CartSummary } from "@/components/site/cart-summary";
import { CouponField } from "@/components/site/coupon-field";
import { OrderTypeToggle } from "@/components/site/order-type-toggle";
import { CupIllustration } from "@/components/site/coffee/cup-illustration";
import { OtherCartNote } from "@/components/site/other-cart-note";
import { PageHead } from "@/components/site/page-head";
import { StoreClosedBanner } from "@/components/site/store-closed-banner";
import { SuggestedAddOns } from "@/components/site/suggested-add-ons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { usePricedCart } from "@/features/cart";
import { useOutletId } from "@/features/outlet";
import { useOpenState } from "@/features/settings";
import { useT } from "@/i18n";
import { useCart, useCartStore } from "@/store/cart";

export default function CartPage() {
  const t = useT();
  const outletId = useOutletId();
  const { lines, couponCode } = useCart(outletId);
  const orderType = useCartStore((s) => s.orderType);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const { data: cart, isLoading } = usePricedCart(
    lines,
    outletId,
    couponCode,
    orderType,
  );
  const { data: openState } = useOpenState(outletId);

  const canOrder = !openState || (openState.isOpen && openState.acceptingOrders);

  if (isHydrated && lines.length === 0) {
    return (
      <>
        <PageHead title={t.cartPage.title} />
        <Container className="py-10">
          <EmptyState
            {...(outletId === "coffee"
              ? {
                  illustration: <CupIllustration />,
                  title: t.coffeeHome.emptyCartTitle,
                  description: t.coffeeHome.emptyCartBody,
                }
              : {
                  icon: ShoppingBag,
                  title: t.cartPage.empty,
                  description: t.cartPage.emptyBody,
                })}
            action={
              <Button asChild>
                <Link href="/menu">{t.cartPage.browseMenu}</Link>
              </Button>
            }
          />
          {/* An empty basket is where a forgotten one at the other outlet
              is easiest to lose track of. */}
          <OtherCartNote className="mt-6" />
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHead title={t.cartPage.title}>
        <StoreClosedBanner className="mt-5" />
      </PageHead>

      <Container className="grid gap-8 py-6 pb-16 sm:py-10 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div>
          <OrderTypeToggle />

          <OtherCartNote className="mt-5" />

          <Card className="mt-5 divide-y divide-hairline px-4">
            {(cart?.lines ?? []).map((line, index) => (
              <CartLineRow key={line.lineKey} line={line} index={index} />
            ))}
          </Card>

          <SuggestedAddOns className="mt-8" />
        </div>

        <div className="lg:sticky lg:top-24">
          <Card className="p-5">
            <CouponField lines={cart?.lines ?? []} />
            <CartSummary cart={cart} isLoading={isLoading} className="mt-6" />
            <Button
              asChild={canOrder}
              size="lg"
              className="mt-5 w-full"
              disabled={!canOrder}
            >
              {canOrder ? (
                <Link href="/checkout">{t.cartPage.checkout}</Link>
              ) : (
                <span>{t.checkout.blockedTitle}</span>
              )}
            </Button>
          </Card>
        </div>
      </Container>
    </>
  );
}
