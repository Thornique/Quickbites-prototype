"use client";

import Link from "next/link";
import {
  Coffee,
  Croissant,
  CupSoda,
  Leaf,
  Sandwich,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useCategoryCounts } from "@/features/menu";
import { useOutletId } from "@/features/outlet";
import { usePick, useT } from "@/i18n";

/**
 * The coffee menu's sections as a row of pills.
 *
 * The restaurant uses big photographic tiles because eight food categories
 * need to be told apart by sight. Five drink sections do not: a pill with an
 * icon is faster to scan and leaves the photography to the drinks themselves.
 */
const ICONS: Record<string, LucideIcon> = {
  "cat-coffee": Coffee,
  "cat-coffee-cold": CupSoda,
  "cat-coffee-tea": Leaf,
  "cat-coffee-bakes": Croissant,
  "cat-coffee-bites": Sandwich,
};

export function CoffeeCategories() {
  const t = useT();
  const pick = usePick();
  const outletId = useOutletId();
  const { data: categories, isLoading } = useCategories(outletId, true);
  const { data: counts } = useCategoryCounts(outletId);

  return (
    <section className="border-y border-hairline bg-sand-50 py-6">
      <Container>
        <h2 className="sr-only">{t.categories.title}</h2>
        <ul className="snap-rail -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:flex-wrap sm:justify-center sm:overflow-visible">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-11 w-36 rounded-pill" />
              </li>
            ))}

          {(categories ?? []).map((category) => {
            const Icon = ICONS[category.id] ?? Coffee;
            const count = counts?.[category.id] ?? 0;

            return (
              <li key={category.id} className="shrink-0">
                <Link
                  href={`/menu#${category.slug}`}
                  className="inline-flex items-center gap-2 rounded-pill border border-hairline bg-surface py-2.5 pr-4 pl-3 text-sm font-semibold text-ink transition-colors hover:border-brand/50 hover:bg-brand/5 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="shrink-0 text-brand"
                  />
                  {pick(category.name)}
                  <span className="nums text-xs font-medium text-ink-muted">
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
