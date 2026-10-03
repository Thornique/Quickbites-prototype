"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SearchX } from "lucide-react";
import { MenuCard } from "@/components/site/menu-card";
import { PageHead } from "@/components/site/page-head";
import { StoreClosedBanner } from "@/components/site/store-closed-banner";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useMenu } from "@/features/menu";
import { usePick, useT } from "@/i18n";
import { matchesSearch } from "@/lib/search";
import type { Category, MenuItem } from "@/types";
import {
  CategoryNav,
  SECTION_SCROLL_OFFSET,
  SPY_TOLERANCE,
  scrollToCategory,
} from "./category-nav";
import { MenuToolbar } from "./menu-toolbar";
import { useMenuFilters } from "./use-menu-filters";

export function MenuClient() {
  const t = useT();
  const pick = usePick();
  const { state, apply, toggleTag, clear, isFiltered } = useMenuFilters();

  const { data: items, isLoading } = useMenu();
  const { data: categories } = useCategories(true);

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const hasHandledHash = useRef(false);

  /*
    Filtering and sorting happen here rather than in the service call so the
    whole menu is read once and every keystroke re-filters in memory — the
    service adds artificial latency, which would make typing feel broken.
  */
  const filtered = useMemo(() => {
    if (!items) return [];
    let rows = [...items];

    if (state.vegOnly) rows = rows.filter((item) => item.isVeg);
    if (state.nonVegOnly) rows = rows.filter((item) => !item.isVeg);
    if (state.under100) rows = rows.filter((item) => item.price < 100);
    if (state.tags.length > 0) {
      rows = rows.filter((item) => state.tags.every((tag) => item.tags.includes(tag)));
    }
    if (state.query.trim()) {
      rows = rows.filter((item) =>
        matchesSearch(
          [item.name.en, item.name.hi, item.description.en, item.description.hi].join(
            " ",
          ),
          state.query,
        ),
      );
    }

    switch (state.sort) {
      case "price-asc":
        rows.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        rows.sort((a, b) => b.price - a.price);
        break;
      case "name":
        rows.sort((a, b) => pick(a.name).localeCompare(pick(b.name)));
        break;
      default:
        rows.sort((a, b) => b.popularity - a.popularity || a.sortOrder - b.sortOrder);
    }
    return rows;
  }, [items, state, pick]);

  /** Categories that still have something to show, in menu order. */
  const sections = useMemo(() => {
    if (!categories) return [];
    return categories
      .map((category) => ({
        category,
        items: filtered.filter((item) => item.categoryId === category.id),
      }))
      .filter((section) => section.items.length > 0);
  }, [categories, filtered]);

  // Deep link from the home category rail: /menu#hot-coffee
  useEffect(() => {
    if (hasHandledHash.current || sections.length === 0) return;
    const slug = window.location.hash.replace("#", "");
    if (!slug) {
      hasHandledHash.current = true;
      return;
    }
    if (sections.some((section) => section.category.slug === slug)) {
      hasHandledHash.current = true;
      /*
        Scroll once the sections exist, then again shortly after: images
        finishing their load changes the page height, which would otherwise
        leave the reader a little above or below the section they asked for.
      */
      requestAnimationFrame(() => scrollToCategory(slug, false));
      const settle = window.setTimeout(() => scrollToCategory(slug, false), 400);
      return () => window.clearTimeout(settle);
    }
  }, [sections]);

  // Scroll-spy: the section whose top is nearest under the sticky chrome wins.
  useEffect(() => {
    if (sections.length === 0) return;

    const onScroll = () => {
      let current: string | null = null;
      for (const section of sections) {
        const element = document.getElementById(section.category.slug);
        if (!element) continue;
        if (
          element.getBoundingClientRect().top - SECTION_SCROLL_OFFSET <=
          SPY_TOLERANCE
        ) {
          current = section.category.slug;
        }
      }
      setActiveSlug(current ?? sections[0].category.slug);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const categoryName = (category: Category) => pick(category.name);

  return (
    <>
      <PageHead title={t.menu.title} subtitle={t.menu.paymentNote} className="border-b-0">
        <StoreClosedBanner className="mt-5" />

        <div className="mt-6">
          <MenuToolbar
            state={state}
            apply={apply}
            toggleTag={toggleTag}
            clear={clear}
            isFiltered={isFiltered}
            resultCount={filtered.length}
          />
        </div>
      </PageHead>

      {sections.length > 0 && (
        <CategoryNav
          categories={sections.map((section) => section.category)}
          activeSlug={activeSlug}
          onSelect={(slug) => scrollToCategory(slug)}
          counts={Object.fromEntries(
            sections.map((section) => [section.category.id, section.items.length]),
          )}
          labelFor={categoryName}
        />
      )}

      <Container className="pb-24 sm:pb-16">
        {isLoading && (
          <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] w-full rounded-card" />
                <Skeleton className="mt-3 h-5 w-2/3" />
                <Skeleton className="mt-2 h-4 w-full" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            className="my-10"
            icon={SearchX}
            title={t.menu.noResultsTitle}
            description={t.menu.noResultsBody}
            action={
              isFiltered ? (
                <Button variant="outline" onClick={clear}>
                  {t.menu.clearFilters}
                </Button>
              ) : undefined
            }
          />
        )}

        {sections.map((section, sectionIndex) => (
          <section
            key={section.category.id}
            id={section.category.slug}
            className="scroll-mt-40 pt-8"
          >
            <h2 className="text-display text-2xl text-ink uppercase">
              {categoryName(section.category)}
              <span className="nums ml-2 text-base font-normal text-ink-muted normal-case">
                {t.menu.resultCount(section.items.length)}
              </span>
            </h2>
            {section.category.description && (
              <p className="measure mt-1 text-sm text-ink-muted">
                {pick(section.category.description)}
              </p>
            )}

            <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {section.items.map((item: MenuItem, itemIndex: number) => (
                <li key={item.id}>
                  <MenuCard
                    item={item}
                    layout="responsive"
                    categoryName={categoryName(section.category)}
                    className="h-full"
                    /* The first row is the largest paint on this page, so it
                       loads eagerly instead of waiting for the observer. */
                    priority={sectionIndex === 0 && itemIndex < 4}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </>
  );
}
