import { notFound } from "@/lib/errors";
import {
  readCollection,
  readSingleton,
  writeCollection,
  writeSingleton,
} from "@/storage";
import type { Banner, GalleryCategory, GalleryImage, SiteContent } from "@/types";
import { logActivity, newId, nowIso, ready, requirePermission } from "./common";

export async function getSiteContent(): Promise<SiteContent> {
  await ready();
  const content = readSingleton<SiteContent>("siteContent");
  if (!content) throw notFound("Site content");
  return content;
}

export async function updateSiteContent(
  patch: Partial<SiteContent>,
): Promise<SiteContent> {
  await ready();
  const admin = requirePermission("CONTENT");
  const current = readSingleton<SiteContent>("siteContent");
  if (!current) throw notFound("Site content");

  const next: SiteContent = {
    ...current,
    ...patch,
    id: "site-content",
    updatedAt: nowIso(),
  };
  writeSingleton("siteContent", next);
  logActivity(admin, "CONTENT_UPDATED", "Updated website content");
  return next;
}

export async function listBanners(activeOnly = false): Promise<Banner[]> {
  await ready();
  return readCollection<Banner>("banners")
    .filter((b) => !activeOnly || b.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createBanner(
  input: Omit<Banner, "id" | "createdAt">,
): Promise<Banner> {
  await ready();
  const admin = requirePermission("CONTENT");
  const rows = readCollection<Banner>("banners");

  const banner: Banner = {
    ...input,
    id: newId("banner"),
    sortOrder: input.sortOrder || rows.length + 1,
    createdAt: nowIso(),
  };
  writeCollection("banners", [...rows, banner], "create", banner.id);
  logActivity(
    admin,
    "BANNER_CREATED",
    `Added banner "${banner.headline.en}"`,
    banner.id,
  );
  return banner;
}

export async function updateBanner(
  id: string,
  patch: Partial<Omit<Banner, "id" | "createdAt">>,
): Promise<Banner> {
  await ready();
  const admin = requirePermission("CONTENT");
  const rows = readCollection<Banner>("banners");
  const existing = rows.find((b) => b.id === id);
  if (!existing) throw notFound("Banner");

  const next: Banner = { ...existing, ...patch, id, updatedAt: nowIso() };
  writeCollection(
    "banners",
    rows.map((b) => (b.id === id ? next : b)),
    "update",
    id,
  );
  logActivity(admin, "BANNER_UPDATED", `Updated banner "${next.headline.en}"`, id);
  return next;
}

export async function deleteBanner(id: string): Promise<void> {
  await ready();
  const admin = requirePermission("CONTENT");
  const rows = readCollection<Banner>("banners");
  if (!rows.some((b) => b.id === id)) throw notFound("Banner");

  writeCollection(
    "banners",
    rows.filter((b) => b.id !== id),
    "delete",
    id,
  );
  logActivity(admin, "BANNER_DELETED", "Deleted a home banner", id);
}

export async function listGallery(category?: GalleryCategory): Promise<GalleryImage[]> {
  await ready();
  return readCollection<GalleryImage>("gallery")
    .filter((g) => g.isActive)
    .filter((g) => !category || g.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function addGalleryImage(
  input: Omit<GalleryImage, "id" | "createdAt">,
): Promise<GalleryImage> {
  await ready();
  const admin = requirePermission("CONTENT");
  const rows = readCollection<GalleryImage>("gallery");

  const image: GalleryImage = {
    ...input,
    id: newId("gal"),
    sortOrder: input.sortOrder || rows.length + 1,
    createdAt: nowIso(),
  };
  writeCollection("gallery", [...rows, image], "create", image.id);
  logActivity(admin, "GALLERY_ADDED", "Added a gallery image", image.id);
  return image;
}

export async function removeGalleryImage(id: string): Promise<void> {
  await ready();
  const admin = requirePermission("CONTENT");
  const rows = readCollection<GalleryImage>("gallery");
  if (!rows.some((g) => g.id === id)) throw notFound("Gallery image");

  writeCollection(
    "gallery",
    rows.filter((g) => g.id !== id),
    "delete",
    id,
  );
  logActivity(admin, "GALLERY_REMOVED", "Removed a gallery image", id);
}
