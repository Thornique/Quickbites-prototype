import type { MenuItem, OptionGroup } from "@/types";
import { DRINK_ROWS } from "./menu-drinks";
import { FOOD_ROWS } from "./menu-food";
import type { GroupKind, MenuRow } from "./menu-row";
import {
  addOnsGroup,
  coffeeGroup,
  crustGroup,
  makeItMealGroup,
  sizeGroup,
  spiceGroup,
  toppingsGroup,
} from "./option-groups";

const CREATED_AT = "2026-08-01T04:30:00.000Z";

function buildGroups(row: MenuRow): OptionGroup[] {
  const groups: OptionGroup[] = [];
  for (const kind of row.groups ?? []) {
    groups.push(...groupFor(kind, row));
  }
  return groups;
}

function groupFor(kind: GroupKind, row: MenuRow): OptionGroup[] {
  switch (kind) {
    case "size":
      return [sizeGroup(row.slug, row.largeDelta ?? 40)];
    case "addons":
      return [addOnsGroup(row.slug)];
    case "meal":
      return [makeItMealGroup(row.slug)];
    case "spice":
      return [spiceGroup(row.slug)];
    case "crust":
      return [crustGroup(row.slug)];
    case "toppings":
      return [toppingsGroup(row.slug)];
    case "coffee":
      return coffeeGroup(row.slug);
  }
}

function toMenuItem(row: MenuRow, index: number): MenuItem {
  const optionGroups = buildGroups(row);
  /*
    "Customisable" is a fact about the item, not something to hand-maintain in
    40 rows — derive it from whether the item actually has option groups.
  */
  const tags =
    optionGroups.length > 0 ? [...row.tags, "customisable" as const] : row.tags;

  return {
    id: `item-${row.slug}`,
    slug: row.slug,
    categoryId: row.categoryId,
    name: { en: row.en, hi: row.hi },
    description: { en: row.descEn, hi: row.descHi },
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    isVeg: row.isVeg,
    tags,
    images: row.image ? [row.image] : [],
    prepMinutes: row.prepMinutes,
    calories: row.calories,
    isAvailable: true,
    stockItemLinks: row.stock.map(([inventoryItemId, quantityPerUnit]) => ({
      inventoryItemId,
      quantityPerUnit,
    })),
    optionGroups,
    popularity: row.popularity,
    sortOrder: index + 1,
    createdAt: CREATED_AT,
  };
}

export const SEED_MENU_ITEMS: MenuItem[] = [...FOOD_ROWS, ...DRINK_ROWS].map(
  toMenuItem,
);
