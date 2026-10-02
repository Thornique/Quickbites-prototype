"use client";

import { createContext, useContext } from "react";
import { sessionStoreFor, type SessionStore } from "@/store/session";
import type { SessionScope } from "@/storage";

/**
 * Which session the components below are talking about.
 *
 * Everything defaults to the customer session, so the public site needs no
 * wrapper at all; the admin panel wraps its subtree once and every
 * `useSession()`, account menu and notification hook underneath it switches to
 * the admin session without being told individually.
 */
const SessionScopeContext = createContext<SessionScope>("customer");

export function SessionScopeProvider({
  scope,
  children,
}: {
  scope: SessionScope;
  children: React.ReactNode;
}) {
  return (
    <SessionScopeContext.Provider value={scope}>{children}</SessionScopeContext.Provider>
  );
}

export function useSessionScope(): SessionScope {
  return useContext(SessionScopeContext);
}

/** The zustand store for the surrounding scope. */
export function useScopedSessionStore(): SessionStore {
  return sessionStoreFor(useSessionScope());
}
