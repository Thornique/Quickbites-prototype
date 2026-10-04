import { conflict, invalid, notFound } from "@/lib/errors";
import { readCollection, writeCollection } from "@/storage";
import type { Category, MenuItem, OutletId } from "@/types";
import {
  logActivity,
  newId,
  nowIso,
  ready,
  requirePermission,
  slugify,
} from "./common";
import { assertOutletAccess, requireOutlet } from "./outlets";

export async function listCategories(
  outletId: OutletId,
  activeOnly = false,
): Promise<Category[]> {
  await ready();
  return readCollection<Category>("categories")
    .filter((c) => c.outletId === outletId)
    .filter((c) => !activeOnly || c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * A category by its web address. Slugs are unique per outlet, so the outlet
 * is part of the lookup — both outlets may one day sell "desserts".
 */
export async function getCategoryBySlug(
  outletId: OutletId,
  slug: string,
): Promise<Category> {
  await ready();
  const category = readCollection<Category>("categories").find(
    (c) => c.slug === slug && c.outletId === outletId,
  );
  if (!category) throw notFound("Category");
  return category;
}

/** Item counts per category, for the admin list and the menu nav. */
export async function getCategoryCounts(
  outletId: OutletId,
): Promise<Record<string, number>> {
  await ready();
  const counts: Record<string, number> = {};
  for (const item of readCollection<MenuItem>("menuItems")) {
    if (item.outletId !== outletId) continue;
    counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
  }
  return counts;
}

export async function createCategory(
  input: Omit<Category, "id" | "createdAt" | "outletId"> & { outletId?: OutletId },
): Promise<Category> {
  await ready();
  const admin = requirePermission("MENU");
  const outletId = requireOutlet(input.outletId);
  const rows = readCollection<Category>("categories");
  const mine = rows.filter((c) => c.outletId === outletId);

  const slug = slugify(input.slug || input.name.en);
  if (!slug) throw invalid("A category needs a name.", "name");
  if (mine.some((c) => c.slug === slug)) {
    throw conflict(`A category already uses the web address "${slug}".`);
  }

  const category: Category = {
    ...input,
    outletId,
    slug,
    id: newId("cat"),
    sortOrder: input.sortOrder || mine.length + 1,
    createdAt: nowIso(),
  };
  writeCollection("categories", [...rows, category], "create", category.id);
  logActivity(
    admin,
    "CATEGORY_CREATED",
    `Added category "${category.name.en}"`,
    category.id,
  );
  return category;
}

export async function updateCategory(
  id: string,
  patch: Partial<Omit<Category, "id" | "createdAt" | "outletId">>,
): Promise<Category> {
  await ready();
  const admin = requirePermission("MENU");
  const rows = readCollection<Category>("categories");
  const existing = rows.find((c) => c.id === id);
  if (!existing) throw notFound("Category");
  assertOutletAccess(existing.outletId);

  const slug = patch.slug ? slugify(patch.slug) : existing.slug;
  if (
    rows.some((c) => c.slug === slug && c.id !== id && c.outletId === existing.outletId)
  ) {
    throw conflict(`A category already uses the web address "${slug}".`);
  }

  const next: Category = { ...existing, ...patch, slug, id, updatedAt: nowIso() };
  writeCollection(
    "categories",
    rows.map((c) => (c.id === id ? next : c)),
    "update",
    id,
  );
  logActivity(admin, "CATEGORY_UPDATED", `Updated category "${next.name.en}"`, id);
  return next;
}

/**
 * Deletion is blocked while items remain. Pass `moveItemsTo` to relocate them
 * first, which is what the admin UI offers instead of a dead end.
 */
export async function deleteCategory(id: string, moveItemsTo?: string): Promise<void> {
  await ready();
  const admin = requirePermission("MENU");
  const rows = readCollection<Category>("categories");
  const existing = rows.find((c) => c.id === id);
  if (!existing) throw notFound("Category");
  assertOutletAccess(existing.outletId);

  const items = readCollection<MenuItem>("menuItems");
  const owned = items.filter((i) => i.categoryId === id);

  if (owned.length > 0) {
    if (!moveItemsTo) {
      throw conflict(
        `"${existing.name.en}" still has ${owned.length} item${owned.length === 1 ? "" : "s"}. Move them to another category first.`,
      );
    }
    const target = rows.find((c) => c.id === moveItemsTo);
    if (!target) throw notFound("Target category");
    if (target.outletId !== existing.outletId) {
      throw conflict("Items can only be moved to a category in the same outlet.");
    }
    writeCollection(
      "menuItems",
      items.map((i) => (i.categoryId === id ? { ...i, categoryId: moveItemsTo } : i)),
      "update",
    );
  }

  writeCollection(
    "categories",
    rows.filter((c) => c.id !== id),
    "delete",
    id,
  );
  logActivity(admin, "CATEGORY_DELETED", `Deleted category "${existing.name.en}"`, id);
}

/** Persists drag-to-reorder within one outlet. */
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await ready();
  requirePermission("MENU");
  const rows = readCollection<Category>("categories");
  for (const id of orderedIds) {
    const row = rows.find((c) => c.id === id);
    if (row) assertOutletAccess(row.outletId);
  }
  const position = new Map(orderedIds.map((id, index) => [id, index + 1]));
  writeCollection(
    "categories",
    rows.map((c) => ({ ...c, sortOrder: position.get(c.id) ?? c.sortOrder })),
    "update",
  );
}
