import type { IsoDate, LocalizedText, Timestamped } from "./common";
import type { EnquirySubject } from "./engagement";
import type { OutletId, OutletScoped } from "./outlet";

export const GALLERY_CATEGORIES = ["FOOD", "CAFE", "EVENTS"] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryImage extends Timestamped, OutletScoped {
  id: string;
  /** Path under /public/images, or an `idb:` key for an admin upload. */
  src: string;
  alt: LocalizedText;
  category: GalleryCategory;
  sortOrder: number;
  isActive: boolean;
}

export interface Banner extends Timestamped, OutletScoped {
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

/**
 * An off-menu service the cafe sells — party orders, catering, lunch boxes.
 * `subject` is what the "Enquire" button prefills on the enquiry form.
 */
export interface ServiceOffer {
  id: string;
  subject: EnquirySubject;
  title: LocalizedText;
  body: LocalizedText;
  bullets: LocalizedText[];
  priceNote: LocalizedText;
  image: string;
}

/** A fixed-price party pack on /pricing. */
export interface PartyPack {
  id: string;
  name: LocalizedText;
  /** How many people it feeds. */
  people: number;
  price: number;
  inclusions: LocalizedText[];
  isPopular?: boolean;
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
/**
 * The copy that differs between the two outlets. Everything else in
 * SiteContent — the story, the services, the party packs, the legal pages —
 * is one business talking, and is shared.
 */
export interface OutletContent {
  /** The scrolling line above the home sections. */
  offersStrip: LocalizedText;
  addressLine: LocalizedText;
  /** "10 AM - 11 PM, all days" as the admin wants it worded. */
  hoursNote: LocalizedText;
  /** Parking / how-to-find-us note under the home map. */
  locationNote: LocalizedText;
  phone: string;
  whatsapp: string;
}

export interface SiteContent extends Timestamped {
  id: "site-content";
  outlets: Record<OutletId, OutletContent>;
  home: {
    howItWorks: ContentBlock[];
  };
  about: {
    story: ContentBlock;
    values: ContentBlock[];
    hygiene: ContentBlock;
    fssaiNumber: string;
  };
  contact: {
    /** One inbox for both outlets. Addresses and phones are per outlet. */
    email: string;
  };
  services: ServiceOffer[];
  pricing: {
    intro: LocalizedText;
    partyPacks: PartyPack[];
    note: LocalizedText;
  };
  /** Draft policy copy, shown on /privacy and /terms. */
  legal: {
    privacy: ContentBlock[];
    terms: ContentBlock[];
    updatedOn: IsoDate;
  };
  social: {
    instagram: string;
    facebook: string;
  };
  seo: Record<string, SeoMeta>;
}
