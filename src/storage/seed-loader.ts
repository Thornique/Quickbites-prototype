import { buildSeedData } from "@/data/seed";
import {
  clearAllCollections,
  getStoredSchemaVersion,
  hasStorage,
  readCollection,
  setStoredSchemaVersion,
  writeCollection,
  writeSingleton,
} from "./adapter";
import { SCHEMA_VERSION } from "./keys";
import { publish } from "./sync";

/*
  Seeding runs once per browser. It is also the migration hook: when
  SCHEMA_VERSION changes the stored data is wiped and rebuilt, which is the
  right trade-off for a prototype where no real user data exists.
*/

let seedPromise: Promise<void> | null = null;

function needsSeeding(): boolean {
  if (getStoredSchemaVersion() !== SCHEMA_VERSION) return true;
  // A cleared or partially-wiped store should rebuild rather than render empty.
  return readCollection("menuItems").length === 0;
}

async function writeSeed(): Promise<void> {
  const data = await buildSeedData();

  clearAllCollections();

  writeCollection("users", data.users, "reset");
  writeCollection("categories", data.categories, "reset");
  writeCollection("menuItems", data.menuItems, "reset");
  writeCollection("coupons", data.coupons, "reset");
  writeCollection("orders", data.orders, "reset");
  writeCollection("inventoryItems", data.inventoryItems, "reset");
  writeCollection("stockMovements", data.stockMovements, "reset");
  writeCollection("enquiries", data.enquiries, "reset");
  writeCollection("bookings", data.bookings, "reset");
  writeCollection("reviews", data.reviews, "reset");
  writeCollection("gallery", data.gallery, "reset");
  writeCollection("banners", data.banners, "reset");
  writeCollection("activityLog", data.activityLog, "reset");
  writeCollection("counters", data.counters, "reset");
  writeSingleton("siteContent", data.siteContent);
  writeSingleton("storeSettings", data.storeSettings);

  setStoredSchemaVersion();
}

/**
 * Seeds on first load or after a schema bump. Safe to call from many places —
 * concurrent callers share one promise, so the dataset is only built once.
 */
export function ensureSeeded(): Promise<void> {
  if (!hasStorage()) return Promise.resolve();
  if (seedPromise) return seedPromise;

  if (!needsSeeding()) {
    seedPromise = Promise.resolve();
    return seedPromise;
  }

  seedPromise = writeSeed().catch((error) => {
    // Let the next caller retry rather than caching a failed seed.
    seedPromise = null;
    throw error;
  });
  return seedPromise;
}

/** Wipes everything and rebuilds the demo dataset. Used by admin Settings. */
export async function resetDemoData(): Promise<void> {
  seedPromise = null;
  clearAllCollections();
  await writeSeed();
  seedPromise = Promise.resolve();
  // Tell every other tab to re-read everything.
  publish("menuItems", "reset");
}
