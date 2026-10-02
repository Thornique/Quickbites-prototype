import { AppError } from "@/lib/errors";
import type { CollectionName } from "./keys";
import { COLLECTIONS, VERSION_KEY, SCHEMA_VERSION, collectionKey } from "./keys";
import { publish, registerCollectionKeys } from "./sync";

registerCollectionKeys(COLLECTIONS);

/** True in the browser, false during SSR and prerendering. */
export function hasStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "qb:probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function isQuotaError(error: unknown): boolean {
  if (!(error instanceof DOMException)) return false;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22
  );
}

/** Read raw JSON, returning the fallback when absent, corrupt or unavailable. */
function readRaw<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    /*
      Corrupt JSON must not take the whole app down: drop the bad entry and
      fall back, which lets the seed loader rebuild the collection.
    */
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing further we can do */
    }
    return fallback;
  }
}

function writeRaw(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (isQuotaError(error)) {
      throw new AppError(
        "STORAGE_FULL",
        "Browser storage is full. Remove some uploaded images or reset the demo data to continue.",
      );
    }
    throw error;
  }
}

/** Read a whole collection. */
export function readCollection<T>(collection: CollectionName): T[] {
  return readRaw<T[]>(collectionKey(collection), []);
}

/**
 * Replace a whole collection. `action` and `id` are forwarded to the
 * cross-tab sync event so listening tabs know what changed.
 */
export function writeCollection<T>(
  collection: CollectionName,
  rows: T[],
  action: "create" | "update" | "delete" | "reset" = "update",
  id?: string,
): void {
  writeRaw(collectionKey(collection), rows);
  publish(collection, action, id);
}

/** Read a single-object collection such as storeSettings or siteContent. */
export function readSingleton<T>(collection: CollectionName): T | null {
  return readRaw<T | null>(collectionKey(collection), null);
}

export function writeSingleton<T>(collection: CollectionName, value: T): void {
  writeRaw(collectionKey(collection), value);
  publish(collection, "update");
}

/** Generic helpers for keys outside the versioned collections (session, cart). */
export function readKey<T>(key: string, fallback: T): T {
  return readRaw<T>(key, fallback);
}

export function writeKey(key: string, value: unknown): void {
  writeRaw(key, value);
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function getStoredSchemaVersion(): number | null {
  return readRaw<number | null>(VERSION_KEY, null);
}

export function setStoredSchemaVersion(): void {
  writeRaw(VERSION_KEY, SCHEMA_VERSION);
}

/** The agreed ceiling for seeded demo data. */
export const STORAGE_BUDGET_BYTES = 1.5 * 1024 * 1024;
/** Above this share of the budget we warn in development. */
const WARN_AT = 0.8;

let hasWarnedAboutSize = false;

/**
 * Warns once per session when storage passes 80% of the budget. A live demo
 * adds orders, signups and notifications, and localStorage fails hard rather
 * than degrading, so the warning needs to arrive well before the ceiling.
 */
export function warnIfStorageTight(bytes: number): void {
  if (process.env.NODE_ENV === "production" || hasWarnedAboutSize) return;
  if (bytes < STORAGE_BUDGET_BYTES * WARN_AT) return;
  hasWarnedAboutSize = true;
  const percent = Math.round((bytes / STORAGE_BUDGET_BYTES) * 100);
  console.warn(
    `[Quick Bites] localStorage is at ${percent}% of the ${(STORAGE_BUDGET_BYTES / 1024 / 1024).toFixed(1)}MB budget ` +
      `(${(bytes / 1024).toFixed(0)}KB). Trim seeded history or reset the demo data before it fills.`,
  );
}

/** Byte size of everything under our namespace, for the dev data screen. */
export function getStorageFootprint(): {
  bytes: number;
  perCollection: Record<string, number>;
} {
  const perCollection: Record<string, number> = {};
  let bytes = 0;
  if (typeof window === "undefined") return { bytes, perCollection };

  for (const collection of COLLECTIONS) {
    const raw = window.localStorage.getItem(collectionKey(collection)) ?? "";
    // Stored as UTF-16 in practice, but byte length of the UTF-8 encoding is
    // the number that matters when comparing against the ~1.5MB budget.
    const size = new Blob([raw]).size;
    perCollection[collection] = size;
    bytes += size;
  }
  warnIfStorageTight(bytes);
  return { bytes, perCollection };
}

/** Wipe every versioned collection. Used by resetDemoData(). */
export function clearAllCollections(): void {
  if (typeof window === "undefined") return;
  for (const collection of COLLECTIONS) {
    try {
      window.localStorage.removeItem(collectionKey(collection));
    } catch {
      /* ignore */
    }
  }
}
