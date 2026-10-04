"use client";

import { getSiteContent, listBanners, listGallery } from "@/services/content";
import type { GalleryCategory, OutletId } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useSiteContent() {
  return useStoreQuery(getSiteContent, ["siteContent"]);
}

export function useBanners(outletId: OutletId, activeOnly = true) {
  return useStoreQuery(
    () => listBanners(outletId, activeOnly),
    ["banners"],
    [outletId, activeOnly],
  );
}

export function useGallery(outletId: OutletId, category?: GalleryCategory) {
  return useStoreQuery(
    () => listGallery(outletId, category),
    ["gallery"],
    [outletId, category],
  );
}
