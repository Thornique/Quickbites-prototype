"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MenuCard } from "@/components/site/menu-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useBestsellers, useCategories } from "@/features/menu";
import { useOutletId } from "@/features/outlet";
import { usePick, useT } from "@/i18n";

export function Bestsellers() {
  const t = useT();
  const pick = usePick();
  const outletId = useOutletId();
  const { data: items, isLoading } = useBestsellers(outletId, 8);
  const { data: categories } = useCategories(outletId);
  const railRef = useRef<HTMLUListElement>(null);

  const categoryName = (categoryId: string) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category ? pick(category.name) : undefined;
  };

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="bg-surface py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow={t.bestsellers.eyebrow}
          title={t.bestsellers.title}
          description={t.bestsellers.description}
          action={
            <div className="flex items-center gap-2">
              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => scrollBy(-1)}
                  aria-label={t.bestsellers.scrollLeft}
                  className="inline-flex size-9 items-center justify-center rounded-control border border-hairline text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBy(1)}
                  aria-label={t.bestsellers.scrollRight}
                  className="inline-flex size-9 items-center justify-center rounded-control border border-hairline text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/menu">{t.bestsellers.seeAll}</Link>
              </Button>
            </div>
          }
        />

        <ul
          ref={railRef}
          className="relative -mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        >
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="w-[70vw] shrink-0 sm:w-64">
                <Skeleton className="aspect-[4/3] w-full rounded-card" />
                <Skeleton className="mt-3 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </li>
            ))}

          {items?.map((item) => (
            <li key={item.id} className="w-[70vw] shrink-0 snap-start sm:w-64">
              <MenuCard
                item={item}
                categoryName={categoryName(item.categoryId)}
                className="h-full"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
