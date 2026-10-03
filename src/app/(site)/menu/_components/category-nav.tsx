"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/container";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

/**
 * Height to leave clear when scrolling a section to the top: the sticky site
 * header plus this sticky tab strip. Kept here so the scroll offset and the
 * CSS scroll-margin can never drift apart.
 */
export const SECTION_SCROLL_OFFSET = 160;

/**
 * Slack when deciding which section is "current". A section scrolled to the
 * top sits exactly at its scroll-margin, and sub-pixel rounding plus the
 * header shrinking on scroll can leave it a little below that.
 */
export const SPY_TOLERANCE = 28;

export interface CategoryNavProps {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  counts: Record<string, number>;
  labelFor: (category: Category) => string;
}

/**
 * Sticky horizontal tabs that follow the reader down the menu.
 *
 * The strip runs the full width of the viewport and carries the rule and
 * surface, the way a real navigation bar does; only the tabs inside are held
 * to the page measure.
 */
export function CategoryNav({
  categories,
  activeSlug,
  onSelect,
  counts,
  labelFor,
}: CategoryNavProps) {
  const t = useT();
  const railRef = useRef<HTMLUListElement>(null);

  /*
    Keep the active tab in view. The rail's own scrollLeft is set directly
    rather than calling scrollIntoView, which can also move the page and
    interrupt the smooth vertical scroll a tab click just started.
  */
  useEffect(() => {
    const rail = railRef.current;
    if (!activeSlug || !rail) return;
    const tab = rail.querySelector<HTMLElement>(`[data-slug="${activeSlug}"]`);
    if (!tab) return;
    const target = tab.offsetLeft - rail.clientWidth / 2 + tab.clientWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeSlug]);

  return (
    <nav
      aria-label={t.menu.categoriesLabel}
      className="sticky top-25 z-30 border-y border-hairline bg-surface"
    >
      <Container className="px-0 sm:px-6 lg:px-8">
        <ul
          ref={railRef}
          className="flex gap-1 overflow-x-auto px-4 py-2 sm:px-0"
        >
          {categories.map((category) => {
            const isActive = activeSlug === category.slug;
            return (
              <li key={category.id} className="shrink-0">
                <button
                  type="button"
                  data-slug={category.slug}
                  onClick={() => onSelect(category.slug)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "shrink-0 rounded-pill px-3.5 py-2 text-sm font-bold whitespace-nowrap transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                    isActive
                      ? "bg-cocoa text-white"
                      : "text-ink-muted hover:bg-sand-100 hover:text-ink",
                  )}
                >
                  {labelFor(category)}
                  {counts[category.id] !== undefined && (
                    <span className="nums ml-1.5 opacity-60">
                      {counts[category.id]}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}

/**
 * Scrolls a category section under the sticky chrome rather than behind it.
 *
 * Uses scrollIntoView so the browser honours the section's `scroll-mt`, which
 * keeps the clearance in CSS next to the sticky elements that cause it —
 * measuring offsets by hand went wrong as soon as images changed the layout.
 */
export function scrollToCategory(slug: string, smooth = true): void {
  const section = document.getElementById(slug);
  if (!section) return;
  section.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}
