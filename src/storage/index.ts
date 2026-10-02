/**
 * localStorage adapter: namespaced qb:v1:* keys, schema version and
 * migrations, safe JSON, quota handling, seed loader and cross-tab sync.
 * UI components never import from here — they go through src/services.
 */

export {
  STORAGE_BUDGET_BYTES,
  clearAllCollections,
  getStorageFootprint,
  getStoredSchemaVersion,
  hasStorage,
  readCollection,
  readKey,
  readSingleton,
  removeKey,
  setStoredSchemaVersion,
  warnIfStorageTight,
  writeCollection,
  writeKey,
  writeSingleton,
} from "./adapter";

export {
  COLLECTIONS,
  IDB_IMAGE_PREFIX,
  LOCALE_KEY,
  SCHEMA_VERSION,
  SESSION_KEY,
  SYNC_CHANNEL,
  cartKey,
  collectionKey,
  notificationPrefsKey,
} from "./keys";
export type { CollectionName } from "./keys";

export { ensureSeeded, resetDemoData } from "./seed-loader";

export { publish, subscribe } from "./sync";
export type { SyncAction, SyncEvent } from "./sync";

export {
  deleteUploadedImage,
  getUploadedImageFootprint,
  getUploadedImageUrl,
  isIdbImage,
  storeUploadedImage,
} from "./images";
