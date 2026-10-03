import { notFound } from "@/lib/errors";
import { estimatePrepMinutes } from "@/lib/prep-time";
import { readSingleton, resetDemoData, writeSingleton } from "@/storage";
import type { StoreSettings, Weekday } from "@/types";
import { WEEKDAYS } from "@/types";
import { countActiveOrders } from "./cart-pricing";
import {
  logActivity,
  nowIso,
  ready,
  requirePermission,
  requireSuperAdmin,
} from "./common";

export async function getSettings(): Promise<StoreSettings> {
  await ready();
  const settings = readSingleton<StoreSettings>("storeSettings");
  if (!settings) throw notFound("Store settings");
  return settings;
}

export async function updateSettings(
  patch: Partial<Omit<StoreSettings, "id" | "createdAt">>,
): Promise<StoreSettings> {
  await ready();
  const admin = requirePermission("SETTINGS");
  const current = readSingleton<StoreSettings>("storeSettings");
  if (!current) throw notFound("Store settings");

  const next: StoreSettings = {
    ...current,
    ...patch,
    id: "store-settings",
    updatedAt: nowIso(),
  };
  writeSingleton("storeSettings", next);
  logActivity(admin, "SETTINGS_UPDATED", "Updated store settings");
  return next;
}

/** Topbar quick toggles. */
export async function setStoreOpen(isOpen: boolean): Promise<StoreSettings> {
  return updateSettings({ isOpen });
}

export async function setAcceptingOrders(
  acceptingOrders: boolean,
): Promise<StoreSettings> {
  return updateSettings({ acceptingOrders });
}

export interface OpenState {
  isOpen: boolean;
  acceptingOrders: boolean;
  /** "Open now · till 11 PM" or "Closed · opens 10 AM". */
  opensAt?: string;
  closesAt?: string;
  reason?: "MANUAL" | "HOLIDAY" | "OUT_OF_HOURS";
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Whether the store is open right now. The manual switch can close an
 * otherwise-open store, but never force it open outside its hours.
 */
export function computeOpenState(settings: StoreSettings, now = new Date()): OpenState {
  const weekday = WEEKDAYS[now.getDay()] as Weekday;
  const hours = settings.hours[weekday];
  const dateKey = now.toISOString().slice(0, 10);

  const base = {
    acceptingOrders: settings.acceptingOrders,
    opensAt: hours.openTime,
    closesAt: hours.closeTime,
  };

  if (settings.holidays.includes(dateKey)) {
    return { ...base, isOpen: false, reason: "HOLIDAY" };
  }
  if (hours.isClosed) {
    return { ...base, isOpen: false, reason: "OUT_OF_HOURS" };
  }

  const minutes = now.getHours() * 60 + now.getMinutes();
  const withinHours =
    minutes >= toMinutes(hours.openTime) && minutes < toMinutes(hours.closeTime);

  if (!withinHours) return { ...base, isOpen: false, reason: "OUT_OF_HOURS" };
  if (!settings.isOpen) return { ...base, isOpen: false, reason: "MANUAL" };

  return { ...base, isOpen: true };
}

export async function getOpenState(now = new Date()): Promise<OpenState> {
  return computeOpenState(await getSettings(), now);
}

/**
 * Live "ready in about N minutes" shown on the home strip and in Settings,
 * using a typical 8-minute item so the number is representative.
 */
export async function getCurrentPrepEstimate(): Promise<number> {
  const settings = await getSettings();
  return estimatePrepMinutes({
    prepMinutes: [8],
    activeOrders: countActiveOrders(),
    basePrepBufferMinutes: settings.basePrepBufferMinutes,
    perActiveOrderMinutes: settings.perActiveOrderMinutes,
  });
}

/** Destructive — super admin only, behind a typed confirmation in the UI. */
export async function resetDemo(): Promise<void> {
  await ready();
  const admin = requireSuperAdmin();
  await resetDemoData();
  logActivity(admin, "DEMO_RESET", "Reset all demo data");
}
