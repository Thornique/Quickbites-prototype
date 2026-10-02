import type { LocalizedText, Timestamped } from "./common";

export const GALLERY_CATEGORIES = ["FOOD", "CAFE", "EVENTS"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryImage extends Timestamped {
  id: string;
  /** Path under /public/images, or an `idb:` key for an admin upload. */
  src: string;
  alt: LocalizedText;
  category: GalleryCategory;
  sortOrder: number;
  isActive: boolean;
}

export interface Banner extends Timestamped {
  id: string;
  image: string;
  headline: LocalizedText;
  subhead: LocalizedText;
  ctaLabel: LocalizedText;
  ctaHref: string;
  sortOrder: number;
  isActive: boolean;
}

/** A single editable block of page copy. */
export interface ContentBlock {
  heading: LocalizedText;
  body: LocalizedText;
}

/** Per-page SEO, editable from the admin content module. */
export interface SeoMeta {
  title: LocalizedText;
  description: LocalizedText;
}

/**
 * Editable site copy. Everything the admin can reword without a deploy lives
 * here rather than being hard-coded into the pages.
 */
export interface SiteContent extends Timestamped {
  id: "site-content";
  offersStrip: LocalizedText;
  home: {
    howItWorks: ContentBlock[];
    locationNote: LocalizedText;
  };
  about: {
    story: ContentBlock;
    values: ContentBlock[];
    hygiene: ContentBlock;
    fssaiNumber: string;
  };
  contact: {
    addressLine: LocalizedText;
    phone: string;
    whatsapp: string;
    email: string;
  };
  social: {
    instagram: string;
    facebook: string;
  };
  seo: Record<string, SeoMeta>;
}
