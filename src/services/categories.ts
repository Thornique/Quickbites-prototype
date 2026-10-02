import { conflict, invalid, notFound } from "@/lib/errors";
import { readCollection, writeCollection } from "@/storage";
import type { Category, MenuItem } from "@/types";
import {
  logActivity,
  newId,
  nowIso,
  ready,
  requirePermission,
  slugify,
} from "./common";

export async function listCategories(activeOnly = false): Promise<Category[]> {
  await ready();
  return readCollection<Category>("categories")
    .filter((c) => !activeOnly || c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  await ready();
  const category = readCollection<Category>("categories").find((c) => c.slug === slug);
  if (!category) throw notFound("Category");
  return category;
}

/** Item counts per category, for the admin list and the menu nav. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  await ready();
  const counts: Record<string, number> = {};
  for (const item of readCollection<MenuItem>("menuItems")) {
    counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
  }
  return counts;
}

export async function createCategory(
  input: Omit<Category, "id" | "createdAt">,
): Promise<Category> {
  await ready();
  const admin = requirePermission("MENU");
  const rows = readCollection<Category>("categories");

  const slug = slugify(input.slug || input.name.en);
  if (!slug) throw invalid("A category needs a name.", "name");
  if (rows.some((c) => c.slug === slug)) {
    throw conflict(`A category already uses the web address "${slug}".`);
  }

  const category: Category = {
    ...input,
    slug,
    id: newId("cat"),
    sortOrder: input.sortOrder || rows.length + 1,
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
  patch: Partial<Omit<Category, "id" | "createdAt">>,
): Promise<Category> {
  await ready();
  const admin = requirePermission("MENU");
  const rows = readCollection<Category>("categories");
  const existing = rows.find((c) => c.id === id);
  if (!existing) throw notFound("Category");

  const slug = patch.slug ? slugify(patch.slug) : existing.slug;
  if (rows.some((c) => c.slug === slug && c.id !== id)) {
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

  const items = readCollection<MenuItem>("menuItems");
  const owned = items.filter((i) => i.categoryId === id);

  if (owned.length > 0) {
    if (!moveItemsTo) {
      throw conflict(
        `"${existing.name.en}" still has ${owned.length} item${owned.length === 1 ? "" : "s"}. Move them to another category first.`,
      );
    }
    if (!rows.some((c) => c.id === moveItemsTo)) throw notFound("Target category");
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

/** Persists drag-to-reorder. */
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await ready();
  requirePermission("MENU");
  const rows = readCollection<Category>("categories");
  const position = new Map(orderedIds.map((id, index) => [id, index + 1]));
  writeCollection(
    "categories",
    rows.map((c) => ({ ...c, sortOrder: position.get(c.id) ?? c.sortOrder })),
    "update",
  );
}
