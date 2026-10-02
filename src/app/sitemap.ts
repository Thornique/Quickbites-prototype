import type { MetadataRoute } from "next";
import { SEED_CATEGORIES } from "@/data/seed/categories";
import { SEED_MENU_ITEMS } from "@/data/seed/menu-items";
import { SITE_URL } from "@/lib/constants";

/**
 * Built from the seed rather than localStorage: a sitemap is generated at
 * build time on the server, where the browser store does not exist. When the
 * menu changes in the admin panel the deployed sitemap follows on the next
 * build, which is the right cadence for a prototype.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "/", priority: 1 },
    { path: "/menu", priority: 0.9 },
    { path: "/about", priority: 0.6 },
    { path: "/gallery", priority: 0.5 },
    { path: "/reviews", priority: 0.5 },
    { path: "/services", priority: 0.6 },
    { path: "/pricing", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/book-table", priority: 0.7 },
    { path: "/privacy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
    ...SEED_CATEGORIES.map((category) => ({
      url: `${SITE_URL}/menu#${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...SEED_MENU_ITEMS.map((item) => ({
      url: `${SITE_URL}/menu/${item.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
