"use client";

import { listActivityLog, listStaff } from "@/services/staff";
import { useStoreQuery } from "../use-store-query";

export function useStaff() {
  return useStoreQuery(listStaff, ["users"]);
}

export function useActivityLog(limit = 50) {
  return useStoreQuery(() => listActivityLog(limit), ["activityLog"], [limit]);
}
