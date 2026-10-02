import type { LocalizedText, Timestamped } from "./common";

/** Marketing labels shown on menu cards. */
export const MENU_ITEM_TAGS = [
  "bestseller",
  "new",
  "spicy",
  "customisable",
  "combo",
] as const;
export type MenuItemTag = (typeof MENU_ITEM_TAGS)[number];

export interface Category extends Timestamped {
  id: string;
  slug: string;
  name: LocalizedText;
  description?: LocalizedText;
  image: string;
  /** Controls order in the menu nav and the home category rail. */
  sortOrder: number;
  isActive: boolean;
}

/** One selectable choice inside an option group. */
export interface MenuOption {
  id: string;
  name: LocalizedText;
  /** Added to the base price. 0 for the default choice, negative is allowed. */
  priceDelta: number;
  isAvailable: boolean;
}

/**
 * A set of choices on an item — "Size" (single select, required) or
 * "Add-ons" (multi select, optional, capped by maxSelect).
 */
export interface OptionGroup {
  id: string;
  name: LocalizedText;
  type: "single" | "multi";
  isRequired: boolean;
  /** Only meaningful for multi-select groups. */
  minSelect: number;
  maxSelect: number;
  options: MenuOption[];
}

/** How much of an inventory item one unit of this menu item consumes. */
export interface StockItemLink {
  inventoryItemId: string;
  /** Quantity consumed per menu item sold, in the inventory item's unit. */
  quantityPerUnit: number;
}

export interface MenuItem extends Timestamped {
  id: string;
  slug: string;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Base price in whole rupees, before options. */
  price: number;
  /** Original price for strike-through display; undefined when not discounted. */
  compareAtPrice?: number;
  isVeg: boolean;
  tags: MenuItemTag[];
  /** Paths under /public/images. First entry is the card image. */
  images: string[];
  /** Cooking time used by the ready-by estimate. */
  prepMinutes: number;
  calories?: number;
  isAvailable: boolean;
  /**
   * Set when stock ran out rather than by an admin toggle, so the item can be
   * restored automatically once the linked inventory is replenished.
   */
  unavailableReason?: "OUT_OF_STOCK" | "MANUAL";
  stockItemLinks: StockItemLink[];
  optionGroups: OptionGroup[];
  /** Drives the "Bestsellers" rail and the popularity sort. */
  popularity: number;
  sortOrder: number;
}
