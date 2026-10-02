"use client";

import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { PricedCart } from "@/types";

/**
 * The bill. Every figure comes from the pricing service — nothing here adds
 * anything up, so the cart, checkout and the final order cannot disagree.
 */
export function CartSummary({
  cart,
  isLoading,
  className,
}: {
  cart?: PricedCart;
  isLoading?: boolean;
  className?: string;
}) {
  const t = useT();

  if (isLoading || !cart) {
    return (
      <div className={cn("grid gap-2", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  const rows: Array<{ label: string; value: React.ReactNode; tone?: "discount" }> = [
    { label: t.cartPage.subtotal, value: <Price value={cart.subtotal} size="sm" /> },
  ];

  if (cart.discount > 0) {
    rows.push({
      label: cart.appliedCouponCode
        ? t.cartPage.discountWithCode(cart.appliedCouponCode)
        : t.cartPage.discount,
      value: (
        <span className="nums text-sm font-semibold text-veg-dark">
          −<Price value={cart.discount} size="sm" className="ml-0.5" />
        </span>
      ),
      tone: "discount",
    });
  }

  // Dine-in food arrives on a plate, so there is nothing to charge for.
  if (cart.orderType === "TAKEAWAY") {
    rows.push({
      label: t.cartPage.packaging,
      value: <Price value={cart.packagingCharge} size="sm" />,
    });
  }

  rows.push({
    label: t.cartPage.gst(cart.taxRate),
    value: <Price value={cart.tax} size="sm" />,
  });

  return (
    <dl className={cn("grid gap-2", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4">
          <dt className="text-sm text-ink-muted">{row.label}</dt>
          <dd className={cn(row.tone === "discount" && "text-veg-dark")}>
            {row.value}
          </dd>
        </div>
      ))}

      <div className="mt-1 flex items-center justify-between gap-4 border-t border-hairline pt-3">
        <dt className="text-base font-semibold text-ink">{t.cartPage.total}</dt>
        <dd>
          <Price value={cart.total} size="xl" />
        </dd>
      </div>
    </dl>
  );
}
