"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useBottomBarSpace } from "@/components/site/use-bottom-bar-space";
import { usePricedCart } from "@/features/cart";
import { useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart";

/** Routes that already own the bottom of the screen. */
const HIDDEN_ON = ["/cart", "/checkout", "/order/"];

/**
 * Mobile-only summary bar: "2 items · ₹348 — View cart".
 *
 * Reserves its own height on the document root so the floating contact
 * buttons lift above it instead of sitting on top.
 */
export function StickyCartBar() {
  const t = useT();
  const pathname = usePathname();
  const lines = useCartStore((s) => s.lines);
  const orderType = useCartStore((s) => s.orderType);
  const couponCode = useCartStore((s) => s.couponCode);
  const isHydrated = useCartStore((s) => s.isHydrated);

  const { data: cart } = usePricedCart(lines, couponCode, orderType);
  const count = isHydrated ? lines.reduce((sum, line) => sum + line.quantity, 0) : 0;
  const isHidden = HIDDEN_ON.some((route) => pathname.startsWith(route));
  const isVisible = count > 0 && !isHidden;

  useBottomBarSpace(isVisible ? "4.25rem" : null);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface py-2.5 sm:hidden">
      <Container>
        <Link
          href="/cart"
          className="flex items-center gap-3 rounded-control bg-brand px-4 py-3 text-white transition-colors hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <ShoppingBag size={20} strokeWidth={1.75} aria-hidden="true" />
          <span className="nums flex-1 text-sm font-semibold">
            {t.cart.itemCount(count)}
            {cart ? ` · ${formatPrice(cart.total)}` : ""}
          </span>
          <span className="text-sm font-bold">{t.cart.viewCart}</span>
        </Link>
      </Container>
    </div>
  );
}
