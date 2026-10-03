"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartDrawer } from "@/components/site/cart-drawer";
import { useT } from "@/i18n";
import { useCartCount } from "@/store/cart";
import { cn } from "@/lib/utils";

export interface CartButtonProps {
  className?: string;
  /** Shows the "Cart" label beside the icon, as in the desktop header row. */
  showLabel?: boolean;
}

/**
 * Header cart control with a live item-count badge. Always visible on mobile,
 * which is where most Quick Bites orders come from.
 */
export function CartButton({ className, showLabel = false }: CartButtonProps) {
  const t = useT();
  const count = useCartCount();

  const trigger = (
    <Link
      href="/cart"
      aria-label={`${t.cart.label}${count > 0 ? `, ${t.cart.itemCount(count)}` : ""}`}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-control transition-colors",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        showLabel
          ? "h-10 gap-2 px-2 text-sm font-bold tracking-wide text-ink uppercase hover:text-brand"
          : "size-10 border border-hairline bg-surface text-ink hover:border-brand hover:text-brand",
        className,
      )}
    >
      <ShoppingBag size={20} strokeWidth={1.75} aria-hidden="true" />
      {showLabel && <span aria-hidden="true">{t.cart.label}</span>}
      {count > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            "nums absolute -top-1.5 inline-flex min-w-5 items-center justify-center rounded-pill bg-brand px-1 py-0.5 text-[0.6875rem] font-bold text-white",
            showLabel ? "left-4" : "-right-1.5",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );

  return <CartDrawer>{trigger}</CartDrawer>;
}
