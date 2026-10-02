"use client";

import { getSiteContent, listBanners, listGallery } from "@/services/content";
import type { GalleryCategory } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useSiteContent() {
  return useStoreQuery(getSiteContent, ["siteContent"]);
}

export function useBanners(activeOnly = true) {
  return useStoreQuery(() => listBanners(activeOnly), ["banners"], [activeOnly]);
}

export function useGallery(category?: GalleryCategory) {
  return useStoreQuery(() => listGallery(category), ["gallery"], [category]);
}
