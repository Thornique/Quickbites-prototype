/** Bumping this re-seeds every collection on next load. */
export const SCHEMA_VERSION = 9;

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

/** Session is stored outside the versioned namespace so it survives re-seeds. */
export const SESSION_KEY = `${NAMESPACE}:session`;

/** Persisted cart, keyed per user id (or "guest"). */
export const cartKey = (ownerId: string) => `${NAMESPACE}:cart:${ownerId}`;

/** Per-user notification preferences (sound, browser alerts). */
export const notificationPrefsKey = (userId: string) => `${NAMESPACE}:notify:${userId}`;

/** Persisted language choice. */
export const LOCALE_KEY = `${NAMESPACE}:locale`;

/** Channel name for cross-tab write notifications. */
export const SYNC_CHANNEL = "qb-sync";

/** Prefix marking an image stored in IndexedDB rather than /public/images. */
export const IDB_IMAGE_PREFIX = "idb:";
