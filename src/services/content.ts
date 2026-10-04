import { notFound } from "@/lib/errors";
import {
  readCollection,
  readSingleton,
  writeCollection,
  writeSingleton,
} from "@/storage";
import type {
  Banner,
  GalleryCategory,
  GalleryImage,
  OutletId,
  SiteContent,
} from "@/types";
import { logActivity, newId, nowIso, ready, requirePermission } from "./common";
import { assertOutletAccess, requireOutlet } from "./outlets";

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

export async function listBanners(
  outletId: OutletId,
  activeOnly = false,
): Promise<Banner[]> {
  await ready();
  return readCollection<Banner>("banners")
    .filter((b) => b.outletId === outletId)
    .filter((b) => !activeOnly || b.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createBanner(
  input: Omit<Banner, "id" | "createdAt" | "outletId"> & { outletId?: OutletId },
): Promise<Banner> {
  await ready();
  const admin = requirePermission("CONTENT");
  const outletId = requireOutlet(input.outletId);
  const rows = readCollection<Banner>("banners");
  const mine = rows.filter((b) => b.outletId === outletId);

  const banner: Banner = {
    ...input,
    outletId,
    id: newId("banner"),
    sortOrder: input.sortOrder || mine.length + 1,
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
  patch: Partial<Omit<Banner, "id" | "createdAt" | "outletId">>,
): Promise<Banner> {
  await ready();
  const admin = requirePermission("CONTENT");
  const rows = readCollection<Banner>("banners");
  const existing = rows.find((b) => b.id === id);
  if (!existing) throw notFound("Banner");
  assertOutletAccess(existing.outletId);

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
  const existing = rows.find((b) => b.id === id);
  if (!existing) throw notFound("Banner");
  assertOutletAccess(existing.outletId);

  writeCollection(
    "banners",
    rows.filter((b) => b.id !== id),
    "delete",
    id,
  );
  logActivity(admin, "BANNER_DELETED", "Deleted a home banner", id);
}

export async function listGallery(
  outletId: OutletId,
  category?: GalleryCategory,
): Promise<GalleryImage[]> {
  await ready();
  return readCollection<GalleryImage>("gallery")
    .filter((g) => g.outletId === outletId)
    .filter((g) => g.isActive)
    .filter((g) => !category || g.category === category)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function addGalleryImage(
  input: Omit<GalleryImage, "id" | "createdAt" | "outletId"> & {
    outletId?: OutletId;
  },
): Promise<GalleryImage> {
  await ready();
  const admin = requirePermission("CONTENT");
  const outletId = requireOutlet(input.outletId);
  const rows = readCollection<GalleryImage>("gallery");
  const mine = rows.filter((g) => g.outletId === outletId);

  const image: GalleryImage = {
    ...input,
    outletId,
    id: newId("gal"),
    sortOrder: input.sortOrder || mine.length + 1,
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
  const existing = rows.find((g) => g.id === id);
  if (!existing) throw notFound("Gallery image");
  assertOutletAccess(existing.outletId);

  writeCollection(
    "gallery",
    rows.filter((g) => g.id !== id),
    "delete",
    id,
  );
  logActivity(admin, "GALLERY_REMOVED", "Removed a gallery image", id);
}
