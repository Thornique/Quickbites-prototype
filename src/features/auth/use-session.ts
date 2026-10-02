"use client";

import { useSessionStore } from "@/store/session";
import type { SessionUser } from "@/types";

export interface SessionSnapshot {
  user: SessionUser | null;
  /** False until the stored session has been read — guards wait on this. */
  isReady: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/** Session plus the role questions the UI keeps asking. */
export function useSession(): SessionSnapshot {
  const user = useSessionStore((s) => s.user);
  const status = useSessionStore((s) => s.status);

  return {
    user,
    isReady: status === "ready",
    isSignedIn: !!user,
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    isSuperAdmin: user?.role === "SUPER_ADMIN",
  };
}

/** Just the user, for components that do not care about loading state. */
export function useSessionUser(): SessionUser | null {
  return useSessionStore((s) => s.user);
}
