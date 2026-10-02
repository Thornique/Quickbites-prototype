"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartLineRow } from "@/components/site/cart-line-row";
import { CartSummary } from "@/components/site/cart-summary";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePricedCart } from "@/features/cart";
import { useT } from "@/i18n";
import { useCartStore } from "@/store/cart";

/**
 * Cart preview from the header. Deliberately read-plus-edit only: the order
 * type, coupons and suggestions live on the full cart page, so the drawer
 * stays something you can scan in a second.
 */
export function CartDrawer({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const lines = useCartStore((s) => s.lines);
  const orderType = useCartStore((s) => s.orderType);
  const couponCode = useCartStore((s) => s.couponCode);
  const { data: cart, isLoading } = usePricedCart(lines, couponCode, orderType);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(26rem,92vw)] flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b border-hairline p-5 text-left">
          <SheetTitle>{t.cartPage.title}</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <EmptyState
            variant="inline"
            icon={ShoppingBag}
            title={t.cartPage.empty}
            description={t.cartPage.emptyBody}
            className="flex-1"
            action={
              <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                <Link href="/menu">{t.cartPage.browseMenu}</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex-1 divide-y divide-hairline overflow-y-auto">
              {(cart?.lines ?? []).map((line, index) => (
                <CartLineRow key={line.lineKey} line={line} index={index} dense />
              ))}
            </div>

            <div className="border-t border-hairline p-5">
              <CartSummary cart={cart} isLoading={isLoading} />
              <Button asChild size="lg" className="mt-4 w-full">
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  {t.cart.viewCart}
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
