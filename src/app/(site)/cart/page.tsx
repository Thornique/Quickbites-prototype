"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartLineRow } from "@/components/site/cart-line-row";
import { CartSummary } from "@/components/site/cart-summary";
import { CouponField } from "@/components/site/coupon-field";
import { OrderTypeToggle } from "@/components/site/order-type-toggle";
import { StoreClosedBanner } from "@/components/site/store-closed-banner";
import { SuggestedAddOns } from "@/components/site/suggested-add-ons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { usePricedCart } from "@/features/cart";
import { AddToCartProvider } from "@/features/menu/add-to-cart";
import { useOpenState } from "@/features/settings";
import { useT } from "@/i18n";
import { useCartStore } from "@/store/cart";

export default function CartPage() {
  const t = useT();
  const lines = useCartStore((s) => s.lines);
  const orderType = useCartStore((s) => s.orderType);
  const couponCode = useCartStore((s) => s.couponCode);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const { data: cart, isLoading } = usePricedCart(lines, couponCode, orderType);
  const { data: openState } = useOpenState();

  const canOrder = !openState || (openState.isOpen && openState.acceptingOrders);

  if (isHydrated && lines.length === 0) {
    return (
      <Container className="py-10">
        <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
          {t.cartPage.title}
        </h1>
        <EmptyState
          className="mt-8"
          icon={ShoppingBag}
          title={t.cartPage.empty}
          description={t.cartPage.emptyBody}
          action={
            <Button asChild>
              <Link href="/menu">{t.cartPage.browseMenu}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <AddToCartProvider>
      <Container className="py-6 pb-16 sm:py-10">
        <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
          {t.cartPage.title}
        </h1>

        <StoreClosedBanner className="mt-5" />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div>
            <OrderTypeToggle />

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
        </div>
      </Container>
    </AddToCartProvider>
  );
}
