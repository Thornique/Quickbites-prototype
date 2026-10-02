"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartDrawer } from "@/components/site/cart-drawer";
import { useT } from "@/i18n";
import { useCartCount } from "@/store/cart";
import { cn } from "@/lib/utils";

/**
 * Header cart control with a live item-count badge. Always visible on mobile,
 * which is where most Quick Bites orders come from.
 */
export function CartButton({ className }: { className?: string }) {
  const t = useT();
  const count = useCartCount();

  const trigger = (
    <Link
      href="/cart"
      aria-label={`${t.cart.label}${count > 0 ? `, ${t.cart.itemCount(count)}` : ""}`}
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center rounded-control",
        "border border-hairline bg-surface text-ink transition-colors",
        "hover:border-brand hover:text-brand",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        className,
      )}
    >
      <ShoppingBag size={20} strokeWidth={1.75} aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="nums absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-pill bg-brand px-1 py-0.5 text-[0.6875rem] font-bold text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );

  return <CartDrawer>{trigger}</CartDrawer>;
}
