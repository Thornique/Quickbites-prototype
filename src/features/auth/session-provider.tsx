"use client";

import { useEffect } from "react";
import { useSessionStore, watchSession } from "@/store/session";

/**
 * Hydrates the session once on mount and keeps it in step with other tabs.
 * Renders children immediately — guards are what wait for `status === "ready"`,
 * so public pages are never held back by an auth check they do not need.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useSessionStore.getState().hydrate();
    return watchSession();
  }, []);

  return <>{children}</>;
}
