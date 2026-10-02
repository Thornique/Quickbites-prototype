"use client";

import { getCurrentPrepEstimate, getOpenState, getSettings } from "@/services/settings";
import { useStoreQuery } from "../use-store-query";

export function useSettings() {
  return useStoreQuery(getSettings, ["storeSettings"]);
}

/** Open/closed pill in the header. */
export function useOpenState() {
  return useStoreQuery(() => getOpenState(), ["storeSettings"]);
}

/** Live "ready in about N minutes" for the home strip. */
export function usePrepEstimate() {
  return useStoreQuery(getCurrentPrepEstimate, ["storeSettings", "orders"]);
}
