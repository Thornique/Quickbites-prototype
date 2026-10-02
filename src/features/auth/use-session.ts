"use client";

import type { SessionUser } from "@/types";
import { useScopedSessionStore } from "./scope";

export interface SessionSnapshot {
  user: SessionUser | null;
  /** False until the stored session has been read — guards wait on this. */
  isReady: boolean;
  isSignedIn: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Session plus the role questions the UI keeps asking — for the surrounding
 * scope, so the same component reads the customer session on the site and the
 * admin session inside the panel.
 */
export function useSession(): SessionSnapshot {
  const useStore = useScopedSessionStore();
  const user = useStore((s) => s.user);
  const status = useStore((s) => s.status);

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
  const useStore = useScopedSessionStore();
  return useStore((s) => s.user);
}

/** Sign-in/out actions for the surrounding scope. */
export function useSessionActions() {
  const useStore = useScopedSessionStore();
  return {
    signIn: useStore((s) => s.signIn),
    signInAsAdmin: useStore((s) => s.signInAsAdmin),
    signUp: useStore((s) => s.signUp),
    signOut: useStore((s) => s.signOut),
    refresh: useStore((s) => s.refresh),
  };
}
