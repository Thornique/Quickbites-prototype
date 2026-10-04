import type { MenuItem, OptionGroup, OutletId } from "@/types";
import { SEED_CATEGORIES } from "./categories";
import { COFFEE_ROWS } from "./menu-coffee";
import { DRINK_ROWS } from "./menu-drinks";
import { FOOD_ROWS } from "./menu-food";
import type { GroupKind, MenuRow } from "./menu-row";
import {
  addOnsGroup,
  crustGroup,
  cupSizeGroup,
  extraShotGroup,
  makeItMealGroup,
  milkTypeGroup,
  sizeGroup,
  spiceGroup,
  sugarGroup,
  toppingsGroup,
} from "./option-groups";

const CREATED_AT = "2026-08-01T04:30:00.000Z";

/** A category only ever belongs to one outlet, so it decides the item's. */
const OUTLET_BY_CATEGORY = new Map<string, OutletId>(
  SEED_CATEGORIES.map((category) => [category.id, category.outletId]),
);

/**
 * Unique key for an item across both outlets. Both menus may carry a
 * "cold-coffee", so ids and option ids are qualified by the outlet — two
 * items sharing an option id would merge in a cart.
 */
function keyOf(row: MenuRow, outletId: OutletId): string {
  return `${outletId}-${row.slug}`;
}

function buildGroups(row: MenuRow, key: string): OptionGroup[] {
  const groups: OptionGroup[] = [];
  for (const kind of row.groups ?? []) {
    groups.push(groupFor(kind, row, key));
  }
  return groups;
}

function groupFor(kind: GroupKind, row: MenuRow, key: string): OptionGroup {
  switch (kind) {
    case "size":
      return sizeGroup(key, row.largeDelta ?? 40);
    case "addons":
      return addOnsGroup(key);
    case "meal":
      return makeItMealGroup(key);
    case "spice":
      return spiceGroup(key);
    case "crust":
      return crustGroup(key);
    case "toppings":
      return toppingsGroup(key);
    case "cupSize":
      return cupSizeGroup(key, row.largeDelta ?? 35);
    case "milkType":
      return milkTypeGroup(key);
    case "shot":
      return extraShotGroup(key);
    case "sugar":
      return sugarGroup(key);
  }
}

function toMenuItem(row: MenuRow, index: number): MenuItem {
  const outletId = OUTLET_BY_CATEGORY.get(row.categoryId) ?? "restaurant";
  const key = keyOf(row, outletId);
  const optionGroups = buildGroups(row, key);
  /*
    "Customisable" is a fact about the item, not something to hand-maintain in
    40 rows — derive it from whether the item actually has option groups.
  */
  const tags =
    optionGroups.length > 0 ? [...row.tags, "customisable" as const] : row.tags;

  return {
    id: `item-${key}`,
    slug: row.slug,
    outletId,
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

export const SEED_MENU_ITEMS: MenuItem[] = [
  ...FOOD_ROWS,
  ...DRINK_ROWS,
  ...COFFEE_ROWS,
].map(toMenuItem);
