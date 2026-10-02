"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useCategoryCounts } from "@/features/menu";
import { usePick, useT } from "@/i18n";

/**
 * Category rail. Links into the menu's section anchors rather than separate
 * pages, so the whole menu stays one scrollable document.
 */
export function CategoryRail() {
  const t = useT();
  const pick = usePick();
  const { data: categories, isLoading } = useCategories(true);
  const { data: counts } = useCategoryCounts();

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow={t.categories.eyebrow}
          title={t.categories.title}
          description={t.categories.description}
        />

        <ul className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="aspect-square w-full rounded-card" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </li>
            ))}

          {categories?.map((category) => (
            <li key={category.id}>
              <Link
                href={`/menu#${category.slug}`}
                className="group block rounded-card focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <div className="relative aspect-square overflow-hidden rounded-card border border-hairline bg-sand-100">
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 140px"
                    className="object-cover transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
                  />
                </div>
                <p className="mt-2 text-sm leading-snug font-semibold text-ink group-hover:text-brand">
                  {pick(category.name)}
                </p>
                {counts?.[category.id] !== undefined && (
                  <p className="nums text-xs text-ink-muted">
                    {t.categories.itemCount(counts[category.id])}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
