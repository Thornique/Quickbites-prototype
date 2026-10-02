"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MenuItemTag } from "@/types";

export type SortKey = "popular" | "price-asc" | "price-desc" | "name";

export interface MenuFilterState {
  query: string;
  vegOnly: boolean;
  nonVegOnly: boolean;
  tags: MenuItemTag[];
  under100: boolean;
  sort: SortKey;
}

const SORTS: SortKey[] = ["popular", "price-asc", "price-desc", "name"];
const TAGS: MenuItemTag[] = ["bestseller", "new", "spicy"];

/**
 * Filter state lives in the URL, not component state.
 *
 * That makes back/forward work, lets a filtered menu be shared or bookmarked,
 * and survives a reload — all of which a customer reasonably expects from a
 * list they have narrowed down.
 */
export function useMenuFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const state = useMemo<MenuFilterState>(() => {
    const sort = params.get("sort");
    const tags = (params.get("tags") ?? "")
      .split(",")
      .filter((tag): tag is MenuItemTag => TAGS.includes(tag as MenuItemTag));

    return {
      query: params.get("q") ?? "",
      vegOnly: params.get("veg") === "1",
      nonVegOnly: params.get("nonveg") === "1",
      tags,
      under100: params.get("under100") === "1",
      sort: SORTS.includes(sort as SortKey) ? (sort as SortKey) : "popular",
    };
  }, [params]);

  const apply = useCallback(
    (patch: Partial<MenuFilterState>) => {
      const next = { ...state, ...patch };
      const search = new URLSearchParams();

      if (next.query.trim()) search.set("q", next.query.trim());
      if (next.vegOnly) search.set("veg", "1");
      if (next.nonVegOnly) search.set("nonveg", "1");
      if (next.under100) search.set("under100", "1");
      if (next.tags.length > 0) search.set("tags", next.tags.join(","));
      if (next.sort !== "popular") search.set("sort", next.sort);

      const queryString = search.toString();
      /*
        replace, not push: typing in the search box would otherwise stack one
        history entry per keystroke and make the back button unusable.
      */
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, state],
  );

  const toggleTag = useCallback(
    (tag: MenuItemTag) =>
      apply({
        tags: state.tags.includes(tag)
          ? state.tags.filter((t) => t !== tag)
          : [...state.tags, tag],
      }),
    [apply, state.tags],
  );

  const clear = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const isFiltered =
    state.query.trim() !== "" ||
    state.vegOnly ||
    state.nonVegOnly ||
    state.under100 ||
    state.tags.length > 0;

  return { state, apply, toggleTag, clear, isFiltered };
}
