"use client";

import { useEffect } from "react";
import { SESSION_SCOPES } from "@/storage";
import { sessionStoreFor, watchSession } from "@/store/session";

/**
 * Hydrates both sessions once on mount and keeps each in step with other tabs
 * of its own kind. Mounted once in the root layout — a tab can show the site
 * and the admin panel at different times, and neither should have to wait for
 * the other's session to be read.
 *
 * Renders children immediately: guards are what wait for `status === "ready"`,
 * so public pages are never held back by an auth check they do not need.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stops = SESSION_SCOPES.map((scope) => {
      void sessionStoreFor(scope).getState().hydrate();
      return watchSession(scope);
    });
    return () => stops.forEach((stop) => stop());
  }, []);

  return <>{children}</>;
}
