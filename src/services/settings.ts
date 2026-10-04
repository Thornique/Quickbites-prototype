import { estimatePrepMinutes } from "@/lib/prep-time";
import { readCollection, resetDemoData, writeCollection } from "@/storage";
import type { OutletId, StoreSettings, Weekday } from "@/types";
import { WEEKDAYS } from "@/types";
import { countActiveOrders } from "./cart-pricing";
import {
  allSettings,
  logActivity,
  nowIso,
  ready,
  requirePermission,
  requireSuperAdmin,
  settingsFor,
} from "./common";
import { assertOutletAccess } from "./outlets";

/** One outlet's settings. Each outlet keeps its own hours, tax and rules. */
export async function getSettings(outletId: OutletId): Promise<StoreSettings> {
  await ready();
  return settingsFor(outletId);
}

/** Both outlets at once, for the super admin's combined views. */
export async function listSettings(): Promise<StoreSettings[]> {
  await ready();
  return allSettings();
}

export async function updateSettings(
  outletId: OutletId,
  patch: Partial<Omit<StoreSettings, "id" | "outletId" | "createdAt">>,
): Promise<StoreSettings> {
  await ready();
  const admin = requirePermission("SETTINGS");
  assertOutletAccess(outletId);

  const current = settingsFor(outletId);
  const next: StoreSettings = {
    ...current,
    ...patch,
    id: current.id,
    outletId,
    updatedAt: nowIso(),
  };
  writeCollection(
    "storeSettings",
    readCollection<StoreSettings>("storeSettings").map((s) =>
      s.outletId === outletId ? next : s,
    ),
    "update",
    next.id,
  );
  logActivity(admin, "SETTINGS_UPDATED", `Updated ${outletId} settings`);
  return next;
}

/** Topbar quick toggles. */
export async function setStoreOpen(
  outletId: OutletId,
  isOpen: boolean,
): Promise<StoreSettings> {
  return updateSettings(outletId, { isOpen });
}

export async function setAcceptingOrders(
  outletId: OutletId,
  acceptingOrders: boolean,
): Promise<StoreSettings> {
  return updateSettings(outletId, { acceptingOrders });
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
 * Whether the outlet is open right now. The manual switch can close an
 * otherwise-open outlet, but never force it open outside its hours.
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

export async function getOpenState(
  outletId: OutletId,
  now = new Date(),
): Promise<OpenState> {
  return computeOpenState(await getSettings(outletId), now);
}

/**
 * Live "ready in about N minutes" shown on the home strip and in Settings,
 * using a typical 8-minute item so the number is representative.
 */
export async function getCurrentPrepEstimate(outletId: OutletId): Promise<number> {
  const settings = await getSettings(outletId);
  return estimatePrepMinutes({
    prepMinutes: [8],
    activeOrders: countActiveOrders(outletId),
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
