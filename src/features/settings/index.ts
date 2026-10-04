"use client";

import {
  getCurrentPrepEstimate,
  getOpenState,
  getSettings,
  listSettings,
} from "@/services/settings";
import type { OutletId } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useSettings(outletId: OutletId) {
  return useStoreQuery(() => getSettings(outletId), ["storeSettings"], [outletId]);
}

/** Both outlets at once, for the super admin's combined screens. */
export function useAllSettings() {
  return useStoreQuery(listSettings, ["storeSettings"]);
}

/** Open/closed pill in the header. */
export function useOpenState(outletId: OutletId) {
  return useStoreQuery(() => getOpenState(outletId), ["storeSettings"], [outletId]);
}

/** Live "ready in about N minutes" for the home strip. */
export function usePrepEstimate(outletId: OutletId) {
  return useStoreQuery(
    () => getCurrentPrepEstimate(outletId),
    ["storeSettings", "orders"],
    [outletId],
  );
}
