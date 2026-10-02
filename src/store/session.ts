"use client";

import { create, type StoreApi, type UseBoundStore } from "zustand";
import * as authService from "@/services/auth";
import { sessionKey, subscribe, type SessionScope } from "@/storage";
import type { SessionUser } from "@/types";

/**
 * UI-facing session state — one store per scope.
 *
 * The persisted session — `{ userId, role, expiresAt }`, seven-day expiry — is
 * written to localStorage by `services/auth.ts` under a key per scope. These
 * stores mirror it in memory and delegate every mutation back to that service
 * rather than persisting a second copy, so there is only ever one writer of
 * the fact that somebody is signed in.
 *
 * The site and the admin panel keep separate scopes, so signing out of one
 * never touches the other.
 */

export type SessionStatus = "loading" | "ready";

interface SessionState {
  user: SessionUser | null;
  status: SessionStatus;
  /** Which side of the app this store speaks for. */
  scope: SessionScope;

  /** Reads the stored session. Called once by SessionProvider on mount. */
  hydrate: () => Promise<void>;
  /** Re-reads after an external change (another tab, a profile edit). */
  refresh: () => Promise<void>;

  signIn: (email: string, password: string) => Promise<SessionUser>;
  signInAsAdmin: (email: string, password: string) => Promise<SessionUser>;
  signUp: (input: authService.SignUpInput) => Promise<SessionUser>;
  signOut: () => Promise<void>;
}

export type SessionStore = UseBoundStore<StoreApi<SessionState>>;

function createSessionStore(scope: SessionScope): SessionStore {
  return create<SessionState>((set) => ({
    user: null,
    status: "loading",
    scope,

    hydrate: async () => {
      const user = await authService.getSession(scope);
      set({ user, status: "ready" });
    },

    refresh: async () => {
      const user = await authService.getSession(scope);
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
      await authService.signOut(scope);
      set({ user: null, status: "ready" });
    },
  }));
}

/** The site's session: /login, /signup, the header menu, /account, checkout. */
export const useCustomerSessionStore = createSessionStore("customer");

/** The panel's session: /admin/login and everything under /admin. */
export const useAdminSessionStore = createSessionStore("admin");

const STORES: Record<SessionScope, SessionStore> = {
  customer: useCustomerSessionStore,
  admin: useAdminSessionStore,
};

export function sessionStoreFor(scope: SessionScope): SessionStore {
  return STORES[scope];
}

/**
 * Starts watching for changes made outside a store: a sign-out in another tab
 * of the same kind, or an admin blocking the signed-in customer. Returns an
 * unsubscribe function.
 */
export function watchSession(scope: SessionScope): () => void {
  const refresh = () => void STORES[scope].getState().refresh();
  const key = sessionKey(scope);

  // Another tab wrote (or cleared) this scope's session key.
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) refresh();
  };
  window.addEventListener("storage", onStorage);

  // The users collection changed — a role, status or profile edit.
  const unsubscribe = subscribe(refresh, ["users"]);

  return () => {
    window.removeEventListener("storage", onStorage);
    unsubscribe();
  };
}
