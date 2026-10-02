"use client";

import { create } from "zustand";
import * as authService from "@/services/auth";
import { SESSION_KEY, subscribe } from "@/storage";
import type { SessionUser } from "@/types";

/**
 * UI-facing session state.
 *
 * The persisted session — `{ userId, role, expiresAt }`, seven-day expiry — is
 * written to localStorage by `services/auth.ts`. This store mirrors it in
 * memory and delegates every mutation back to that service rather than
 * persisting a second copy, so there is only ever one writer of the fact that
 * somebody is signed in.
 */

export type SessionStatus = "loading" | "ready";

interface SessionState {
  user: SessionUser | null;
  status: SessionStatus;

  /** Reads the stored session. Called once by SessionProvider on mount. */
  hydrate: () => Promise<void>;
  /** Re-reads after an external change (another tab, a profile edit). */
  refresh: () => Promise<void>;

  signIn: (email: string, password: string) => Promise<SessionUser>;
  signInAsAdmin: (email: string, password: string) => Promise<SessionUser>;
  signUp: (input: authService.SignUpInput) => Promise<SessionUser>;
  signOut: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  status: "loading",

  hydrate: async () => {
    const user = await authService.getSession();
    set({ user, status: "ready" });
  },

  refresh: async () => {
    const user = await authService.getSession();
    set({ user });
  },

  signIn: async (email, password) => {
    const user = await authService.signIn(email, password);
    set({ user, status: "ready" });
    return user;
  },

  signInAsAdmin: async (email, password) => {
    const user = await authService.signInAsAdmin(email, password);
    set({ user, status: "ready" });
    return user;
  },

  signUp: async (input) => {
    const user = await authService.signUp(input);
    set({ user, status: "ready" });
    return user;
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, status: "ready" });
  },
}));

/**
 * Starts watching for session changes made outside this store: a sign-out in
 * another tab, or an admin blocking the signed-in customer. Returns an
 * unsubscribe function.
 */
export function watchSession(): () => void {
  const refresh = () => void useSessionStore.getState().refresh();

  // Another tab wrote (or cleared) the session key.
  const onStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY) refresh();
  };
  window.addEventListener("storage", onStorage);

  // The users collection changed — a role, status or profile edit.
  const unsubscribe = subscribe(refresh, ["users"]);

  return () => {
    window.removeEventListener("storage", onStorage);
    unsubscribe();
  };
}
