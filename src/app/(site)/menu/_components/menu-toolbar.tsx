"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { MenuItemTag } from "@/types";
import type { MenuFilterState, SortKey } from "./use-menu-filters";

export interface MenuToolbarProps {
  state: MenuFilterState;
  apply: (patch: Partial<MenuFilterState>) => void;
  toggleTag: (tag: MenuItemTag) => void;
  clear: () => void;
  isFiltered: boolean;
  resultCount: number;
}

const SEARCH_DEBOUNCE_MS = 250;

export function MenuToolbar({
  state,
  apply,
  toggleTag,
  clear,
  isFiltered,
  resultCount,
}: MenuToolbarProps) {
  const t = useT();
  const [draft, setDraft] = useState(state.query);

  // Keep the box in step when the URL changes from elsewhere (back button).
  useEffect(() => {
    setDraft(state.query);
  }, [state.query]);

  // Debounced so a URL update does not fire on every keystroke.
  useEffect(() => {
    if (draft === state.query) return;
    const timer = window.setTimeout(() => apply({ query: draft }), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, state.query, apply]);

  const chips: Array<{
    key: string;
    label: string;
    active: boolean;
    onClick: () => void;
  }> = [
    {
      key: "veg",
      label: t.menu.chips.vegOnly,
      active: state.vegOnly,
      // Veg and non-veg are mutually exclusive; turning one on clears the other.
      onClick: () => apply({ vegOnly: !state.vegOnly, nonVegOnly: false }),
    },
    {
      key: "nonveg",
      label: t.menu.chips.nonVeg,
      active: state.nonVegOnly,
      onClick: () => apply({ nonVegOnly: !state.nonVegOnly, vegOnly: false }),
    },
    {
      key: "bestseller",
      label: t.menu.chips.bestseller,
      active: state.tags.includes("bestseller"),
      onClick: () => toggleTag("bestseller"),
    },
    {
      key: "new",
      label: t.menu.chips.new,
      active: state.tags.includes("new"),
      onClick: () => toggleTag("new"),
    },
    {
      key: "spicy",
      label: t.menu.chips.spicy,
      active: state.tags.includes("spicy"),
      onClick: () => toggleTag("spicy"),
    },
    {
      key: "under100",
      label: t.menu.chips.under100,
      active: state.under100,
      onClick: () => apply({ under100: !state.under100 }),
    },
  ];

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id="menu-search"
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            aria-label={t.menu.searchLabel}
            placeholder={t.menu.searchPlaceholder}
            className="pr-10 pl-10"
          />
          {draft && (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                apply({ query: "" });
              }}
              aria-label={t.menu.clearSearch}
              className="absolute top-1/2 right-1 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-control text-ink-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <Select
          value={state.sort}
          onValueChange={(value) => apply({ sort: value as SortKey })}
        >
          <SelectTrigger aria-label={t.menu.sortLabel} className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">{t.menu.sort.popular}</SelectItem>
            <SelectItem value="price-asc">{t.menu.sort.priceAsc}</SelectItem>
            <SelectItem value="price-desc">{t.menu.sort.priceDesc}</SelectItem>
            <SelectItem value="name">{t.menu.sort.name}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="sr-only">{t.menu.filters}</span>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onClick}
            aria-pressed={chip.active}
            className={cn(
              "rounded-pill border px-3 py-1.5 text-sm font-semibold transition-colors",
              "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
              chip.active
                ? "border-brand bg-brand text-white"
                : "border-hairline bg-surface text-ink hover:border-brand hover:text-brand",
            )}
          >
            {chip.label}
          </button>
        ))}

        {isFiltered && (
          <button
            type="button"
            onClick={clear}
            className="rounded-pill px-3 py-1.5 text-sm font-semibold text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t.menu.clearFilters}
          </button>
        )}

        <p aria-live="polite" className="nums ml-auto text-sm text-ink-muted">
          {t.menu.resultCount(resultCount)}
        </p>
      </div>
    </div>
  );
}
