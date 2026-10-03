import { conflict, invalid, notFound } from "@/lib/errors";
import { readCollection, writeCollection } from "@/storage";
import type { MenuItem, MenuItemTag } from "@/types";
import {
  logActivity,
  newId,
  nowIso,
  ready,
  requirePermission,
  slugify,
} from "./common";

export interface MenuFilters {
  categoryId?: string;
  /** Matches English and Hindi names and descriptions. */
  search?: string;
  vegOnly?: boolean;
  nonVegOnly?: boolean;
  tags?: MenuItemTag[];
  maxPrice?: number;
  sort?: "popular" | "price-asc" | "price-desc" | "name";
  /** Admin screens need sold-out items; the storefront hides nothing but marks them. */
  includeUnavailable?: boolean;
}

function matchesSearch(item: MenuItem, term: string): boolean {
  const haystack = [
    item.name.en,
    item.name.hi,
    item.description.en,
    item.description.hi,
    item.slug,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export function filterMenu(items: MenuItem[], filters: MenuFilters = {}): MenuItem[] {
  let rows = [...items];

  if (filters.categoryId)
    rows = rows.filter((i) => i.categoryId === filters.categoryId);
  if (filters.vegOnly) rows = rows.filter((i) => i.isVeg);
  if (filters.nonVegOnly) rows = rows.filter((i) => !i.isVeg);
  if (typeof filters.maxPrice === "number") {
    rows = rows.filter((i) => i.price <= filters.maxPrice!);
  }
  if (filters.tags?.length) {
    rows = rows.filter((i) => filters.tags!.every((tag) => i.tags.includes(tag)));
  }
  const term = filters.search?.trim().toLowerCase();
  if (term) rows = rows.filter((i) => matchesSearch(i, term));

  switch (filters.sort) {
    case "price-asc":
      rows.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      rows.sort((a, b) => b.price - a.price);
      break;
    case "name":
      rows.sort((a, b) => a.name.en.localeCompare(b.name.en));
      break;
    case "popular":
    default:
      rows.sort((a, b) => b.popularity - a.popularity || a.sortOrder - b.sortOrder);
  }

  return rows;
}

export async function listMenuItems(filters: MenuFilters = {}): Promise<MenuItem[]> {
  await ready();
  return filterMenu(readCollection<MenuItem>("menuItems"), filters);
}

export async function getMenuItemBySlug(slug: string): Promise<MenuItem> {
  await ready();
  const item = readCollection<MenuItem>("menuItems").find((i) => i.slug === slug);
  if (!item) throw notFound("Menu item");
  return item;
}

export async function getMenuItemById(id: string): Promise<MenuItem> {
  await ready();
  const item = readCollection<MenuItem>("menuItems").find((i) => i.id === id);
  if (!item) throw notFound("Menu item");
  return item;
}

/** Top items by popularity, for the home rail. Available items only. */
export async function listBestsellers(limit = 8): Promise<MenuItem[]> {
  await ready();
  return readCollection<MenuItem>("menuItems")
    .filter((i) => i.isAvailable)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export async function createMenuItem(
  input: Omit<MenuItem, "id" | "createdAt">,
): Promise<MenuItem> {
  await ready();
  const admin = requirePermission("MENU");
  const items = readCollection<MenuItem>("menuItems");

  const slug = slugify(input.slug || input.name.en);
  if (!slug) throw invalid("A menu item needs a name.", "name");
  if (items.some((i) => i.slug === slug)) {
    throw conflict(`Another item already uses the web address "${slug}".`);
  }

  const item: MenuItem = { ...input, slug, id: newId("item"), createdAt: nowIso() };
  writeCollection("menuItems", [...items, item], "create", item.id);
  logActivity(admin, "MENU_ITEM_CREATED", `Added menu item "${item.name.en}"`, item.id);
  return item;
}

export async function updateMenuItem(
  id: string,
  patch: Partial<Omit<MenuItem, "id" | "createdAt">>,
): Promise<MenuItem> {
  await ready();
  const admin = requirePermission("MENU");
  const items = readCollection<MenuItem>("menuItems");
  const existing = items.find((i) => i.id === id);
  if (!existing) throw notFound("Menu item");

  const slug = patch.slug ? slugify(patch.slug) : existing.slug;
  if (items.some((i) => i.slug === slug && i.id !== id)) {
    throw conflict(`Another item already uses the web address "${slug}".`);
  }

  const next: MenuItem = { ...existing, ...patch, slug, id, updatedAt: nowIso() };
  writeCollection(
    "menuItems",
    items.map((i) => (i.id === id ? next : i)),
    "update",
    id,
  );
  logActivity(admin, "MENU_ITEM_UPDATED", `Updated menu item "${next.name.en}"`, id);
  return next;
}

/** Inline availability switch on the admin menu table. */
export async function setMenuItemAvailability(
  id: string,
  isAvailable: boolean,
): Promise<MenuItem> {
  return updateMenuItem(id, {
    isAvailable,
    unavailableReason: isAvailable ? undefined : "MANUAL",
  });
}

export async function deleteMenuItem(id: string): Promise<void> {
  await ready();
  const admin = requirePermission("MENU");
  const items = readCollection<MenuItem>("menuItems");
  const existing = items.find((i) => i.id === id);
  if (!existing) throw notFound("Menu item");

  writeCollection(
    "menuItems",
    items.filter((i) => i.id !== id),
    "delete",
    id,
  );
  logActivity(
    admin,
    "MENU_ITEM_DELETED",
    `Deleted menu item "${existing.name.en}"`,
    id,
  );
}

/** Copies an item, giving it a fresh slug and id. */
export async function duplicateMenuItem(id: string): Promise<MenuItem> {
  await ready();
  const source = readCollection<MenuItem>("menuItems").find((i) => i.id === id);
  if (!source) throw notFound("Menu item");

  const { id: _id, createdAt: _createdAt, ...rest } = source;
  return createMenuItem({
    ...rest,
    slug: `${source.slug}-copy`,
    name: { en: `${source.name.en} (copy)`, hi: `${source.name.hi} (कॉपी)` },
    isAvailable: false,
  });
}
