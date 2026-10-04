"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useCategoryCounts } from "@/features/menu";
import { useOutletId } from "@/features/outlet";
import { usePick, useT } from "@/i18n";

/**
 * Category rail. Links into the menu's section anchors rather than separate
 * pages, so the whole menu stays one scrollable document.
 *
 * Laid out the way the big chains do it: one scrolling row of square tiles
 * with the name centred underneath, arrows parked outside the row rather than
 * floating over the artwork. A grid would reflow to three ragged rows on a
 * phone; a rail keeps the section the same shape at every width.
 */
export function CategoryRail() {
  const t = useT();
  const pick = usePick();
  const outletId = useOutletId();
  const { data: categories, isLoading } = useCategories(outletId, true);
  const { data: counts } = useCategoryCounts(outletId);
  const railRef = useRef<HTMLUListElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  /*
    The arrows line up with the middle of the tiles, not the middle of the
    rail — the captions below run to one or two lines, so centring on the
    whole row would float them off-centre on the artwork.
  */
  const arrowClass =
    "absolute top-[4.25rem] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface text-ink shadow-card transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:inline-flex";

  return (
    <section className="bg-sand-50 py-12 sm:py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <h2 className="text-display text-2xl text-ink uppercase sm:text-3xl lg:text-4xl">
              {t.categories.title}
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              {t.categories.description(
                categories?.length ?? 0,
                Object.values(counts ?? {}).reduce((sum, n) => sum + n, 0),
              )}
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-ink uppercase transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {t.categories.seeAll}
            <ChevronRight size={16} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative mt-7">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={t.categories.scrollLeft}
            className={`${arrowClass} -left-3 lg:-left-5`}
          >
            <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>

          <ul
            ref={railRef}
            className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-4 sm:px-0"
          >
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="w-28 shrink-0 sm:w-[8.5rem]">
                  <Skeleton className="aspect-square w-full rounded-card" />
                  <Skeleton className="mx-auto mt-2.5 h-4 w-3/4" />
                </li>
              ))}

            {categories?.map((category) => (
              <li key={category.id} className="w-28 shrink-0 snap-start sm:w-[8.5rem]">
                <Link
                  href={`/menu#${category.slug}`}
                  className="group block rounded-card text-center focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <div className="relative aspect-square overflow-hidden rounded-card border border-hairline bg-surface">
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 112px, 136px"
                      className="object-cover transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    />
                  </div>
                  <p className="mt-2.5 text-sm leading-tight font-bold text-ink group-hover:text-brand">
                    {pick(category.name)}
                  </p>
                  {counts?.[category.id] !== undefined && (
                    <p className="nums mt-0.5 text-xs text-ink-muted">
                      {t.categories.itemCount(counts[category.id])}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={t.categories.scrollRight}
            className={`${arrowClass} -right-3 lg:-right-5`}
          >
            <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </Container>
    </section>
  );
}
