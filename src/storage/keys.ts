/** Bumping this re-seeds every collection on next load. */
export const SCHEMA_VERSION = 15;

const NAMESPACE = "qb";

/** Every collection stored in localStorage. */
export const COLLECTIONS = [
  "users",
  "categories",
  "menuItems",
  "coupons",
  "orders",
  "inventoryItems",
  "stockMovements",
  "enquiries",
  "bookings",
  "reviews",
  "gallery",
  "banners",
  "siteContent",
  "storeSettings",
  "notifications",
  "activityLog",
  "counters",
] as const;

export type CollectionName = (typeof COLLECTIONS)[number];

/** Namespaced key, e.g. "qb:v1:menuItems". */
export function collectionKey(collection: CollectionName): string {
  return `${NAMESPACE}:v${SCHEMA_VERSION}:${collection}`;
}

/** Key holding the schema version the data was written with. */
export const VERSION_KEY = `${NAMESPACE}:schemaVersion`;

/**
 * Which part of the app a session belongs to. The public site and the admin
 * panel keep completely separate sessions, so one person can be signed in as a
 * customer in one tab and as the manager in another — which is exactly how the
 * cafe will use this during the demo.
 */
export const SESSION_SCOPES = ["customer", "admin"] as const;
export type SessionScope = (typeof SESSION_SCOPES)[number];

/** Sessions live outside the versioned namespace so they survive re-seeds. */
export const sessionKey = (scope: SessionScope) => `${NAMESPACE}:session:${scope}`;

/** Persisted cart, keyed per user id (or "guest"). Holds both outlets' carts. */
export const cartKey = (ownerId: string) => `${NAMESPACE}:cart:${ownerId}`;

/** Which outlet the customer is browsing. Survives re-seeds. */
export const OUTLET_KEY = `${NAMESPACE}:outlet`;

/** Which outlet (or "all") the admin panel is showing. */
export const ADMIN_OUTLET_KEY = `${NAMESPACE}:adminOutlet`;

/** Per-user notification preferences (sound, browser alerts). */
export const notificationPrefsKey = (userId: string) => `${NAMESPACE}:notify:${userId}`;

/** Persisted language choice. */
export const LOCALE_KEY = `${NAMESPACE}:locale`;

/** Channel name for cross-tab write notifications. */
export const SYNC_CHANNEL = "qb-sync";

/** Prefix marking an image stored in IndexedDB rather than /public/images. */
export const IDB_IMAGE_PREFIX = "idb:";
