/**
 * Static store facts. Anything the admin can edit at runtime lives in
 * StoreSettings (see services/settings.ts); this file holds only the
 * constants that never change for the prototype.
 */

export const STORE = {
  name: "Quick Bites",
  legalName: "Quick Bites Cafe",
  tagline: "Hot, fresh, ready in minutes.",
  addressLine: "Bombay Bazar, Khandwa",
  addressFull: "Bombay Bazar, Khandwa, Madhya Pradesh 450001",
  city: "Khandwa",
  state: "Madhya Pradesh",
  pincode: "450001",
  phoneDisplay: "+91 99999 00000",
  phoneHref: "+919999900000",
  whatsappHref: "919999900000",
  email: "hello@quickbites.in",
  /** Khandwa town centre — used for the map embed on home and contact. */
  geo: { lat: 21.8257, lng: 76.3523 },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Bombay+Bazar%2C+Khandwa%2C+Madhya+Pradesh+450001",
  fssai: "NNNNNNNNNNNNNN",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
  },
} as const;

/** Default opening hours. Admin can override per day in Settings. */
export const OPENING_HOURS = {
  openTime: "10:00",
  closeTime: "23:00",
  label: "10:00 AM – 11:00 PM, all days",
} as const;

/** Order economics. Admin-editable defaults live in StoreSettings. */
export const ORDER_DEFAULTS = {
  taxRatePercent: 5, // GST
  packagingCharge: 10,
  basePrepBufferMinutes: 5,
  perActiveOrderMinutes: 2,
} as const;

/**
 * Canonical origin for sitemap and Open Graph URLs. Overridden per deployment;
 * the placeholder is fine until the client's domain is bought (see step 15).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://quickbites-khandwa.example";

export const CURRENCY = { code: "INR", locale: "en-IN", symbol: "₹" } as const;

export const TIME_ZONE = "Asia/Kolkata";

/** Max length of the customer's note to the kitchen. */
export const MAX_ITEM_NOTE_LENGTH = 120;

export const SUPPORTED_LOCALES = ["en", "hi"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
