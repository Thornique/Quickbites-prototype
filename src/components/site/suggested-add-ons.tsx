"use client";

import { MenuCard } from "@/components/site/menu-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenu } from "@/features/menu";
import { useOutletId } from "@/features/outlet";
import { useT } from "@/i18n";
import { useCart } from "@/store/cart";
import type { OutletId } from "@/types";

/**
 * Categories worth suggesting alongside a main, per outlet. At the coffee
 * counter the upsell is a bake, not a portion of fries.
 */
const SUGGEST_FROM: Record<OutletId, string[]> = {
  restaurant: ["cat-sides", "cat-cold"],
  coffee: ["cat-coffee-bakes", "cat-coffee-bites"],
};

/**
 * "Goes well with this" — sides and cold drinks that are not already in the
 * cart. Chosen by popularity rather than at random, so the row is stable
 * between renders instead of reshuffling as the customer edits the cart.
 */
export function SuggestedAddOns({ className }: { className?: string }) {
  const t = useT();
  const outletId = useOutletId();
  const { lines } = useCart(outletId);
  const { data: items, isLoading } = useMenu({ outletId });

  const inCart = new Set(lines.map((line) => line.menuItemId));
  const suggestions = (items ?? [])
    .filter(
      (item) =>
        SUGGEST_FROM[outletId].includes(item.categoryId) &&
        item.isAvailable &&
        !inCart.has(item.id),
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  if (!isLoading && suggestions.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="text-sm font-semibold text-ink">{t.cartPage.suggestions}</h2>

      <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="w-44 shrink-0">
              <Skeleton className="h-56 w-full rounded-card" />
            </li>
          ))}
        {suggestions.map((item) => (
          <li key={item.id} className="w-44 shrink-0">
            <MenuCard item={item} className="h-full" />
          </li>
        ))}
      </ul>
    </section>
  );
}
