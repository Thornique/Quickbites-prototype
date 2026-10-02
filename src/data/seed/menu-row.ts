import type { MenuItemTag } from "@/types";

/** Which shared option groups an item gets. See option-groups.ts. */
export type GroupKind =
  "size" | "addons" | "meal" | "spice" | "crust" | "toppings" | "coffee";

/**
 * Compact seed row. Expanded into a full MenuItem by menu-items.ts so the
 * repetitive fields (ids, timestamps, availability) are not written 40 times.
 */
export interface MenuRow {
  slug: string;
  categoryId: string;
  en: string;
  hi: string;
  descEn: string;
  descHi: string;
  price: number;
  compareAtPrice?: number;
  isVeg: boolean;
  tags: MenuItemTag[];
  prepMinutes: number;
  calories?: number;
  /** 0–100, drives the Bestsellers rail and the "Popular" sort. */
  popularity: number;
  /**
   * Path under /public/images. Omitted means this item has no photography
   * yet and the UI renders the brand placeholder — see public/images/TODO.md.
   */
  image?: string;
  groups?: GroupKind[];
  /** [inventoryItemId, quantity consumed per unit sold] */
  stock: Array<[string, number]>;
  /** Extra price delta for the Large size, when the item has a size group. */
  largeDelta?: number;
}
