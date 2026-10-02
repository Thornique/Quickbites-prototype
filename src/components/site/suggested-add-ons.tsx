"use client";

import { MenuCard } from "@/components/site/menu-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenu } from "@/features/menu";
import { useT } from "@/i18n";
import { useCartStore } from "@/store/cart";

/** Categories worth suggesting alongside a main. */
const SUGGEST_FROM = ["cat-sides", "cat-cold"];

/**
 * "Goes well with this" — sides and cold drinks that are not already in the
 * cart. Chosen by popularity rather than at random, so the row is stable
 * between renders instead of reshuffling as the customer edits the cart.
 */
export function SuggestedAddOns({ className }: { className?: string }) {
  const t = useT();
  const lines = useCartStore((s) => s.lines);
  const { data: items, isLoading } = useMenu();

  const inCart = new Set(lines.map((line) => line.menuItemId));
  const suggestions = (items ?? [])
    .filter(
      (item) =>
        SUGGEST_FROM.includes(item.categoryId) &&
        item.isAvailable &&
        !inCart.has(item.id),
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  if (!isLoading && suggestions.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="text-sm font-semibold text-ink">{t.cartPage.suggestions}</h2>

      <ul className="mt-3 flex [scrollbar-width:thin] gap-3 overflow-x-auto pb-2">
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
