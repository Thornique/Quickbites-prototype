"use client";

import { SessionScopeProvider } from "@/features/auth";
import { NotificationWatcher } from "@/features/notifications";

/**
 * Everything under /admin — the sign-in screen included — talks to the admin
 * session, never the customer one. One wrapper here is what lets the same
 * browser show a signed-in customer in one tab and the manager in another.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionScopeProvider scope="admin">
      {children}
      <NotificationWatcher />
    </SessionScopeProvider>
  );
}
