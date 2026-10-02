import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/**
 * Internal and personal areas are kept out of the index. The admin panel and
 * account pages are behind guards anyway, but there is no reason for them to
 * appear in search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/checkout", "/dev", "/styleguide", "/order"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
