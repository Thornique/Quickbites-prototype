"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { useT } from "@/i18n";
import { useCartStore } from "@/store/cart";

/**
 * Placeholder. The real cart — line editing, coupons, the price summary and
 * the sticky mobile bar — is built in step 6. This exists so the "View cart"
 * action on the add toast has somewhere to go.
 */
export default function CartPage() {
  const t = useT();
  const lines = useCartStore((s) => s.lines);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const count = isHydrated ? lines.reduce((sum, line) => sum + line.quantity, 0) : 0;

  return (
    <Container className="py-10">
      <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
        {t.cart.label}
      </h1>

      <EmptyState
        className="mt-8"
        icon={ShoppingBag}
        title={count > 0 ? `${t.cart.itemCount(count)} waiting` : t.cart.empty}
        description="The full cart — line editing, coupons and the price summary — arrives in step 6."
        action={
          <Button asChild variant="outline">
            <Link href="/menu">{t.item.backToMenu}</Link>
          </Button>
        }
      />
    </Container>
  );
}
