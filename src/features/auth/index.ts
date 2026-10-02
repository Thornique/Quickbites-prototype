"use client";

import { getSession } from "@/services/auth";
import { useStoreQuery } from "../use-store-query";

/** Current session user, refreshed when the users collection changes. */
export function useSession() {
  return useStoreQuery(getSession, ["users"]);
}
