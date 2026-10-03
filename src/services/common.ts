import { forbidden, unauthorized } from "@/lib/errors";
import { can, canManageStaff } from "@/lib/permissions";
import {
  ensureSeeded,
  readCollection,
  readKey,
  sessionKey,
  writeCollection,
  type SessionScope,
} from "@/storage";
import type { ActivityLogEntry, Permission, Role, User } from "@/types";

/** Session as persisted in localStorage. */
export interface StoredSession {
  userId: string;
  role: Role;
  /** ISO timestamp; sessions last 7 days. */
  expiresAt: string;
}

/**
 * Every read/write path awaits this so the store is seeded before use.
 *
 * This used to add 150–350ms of fake latency to make the loading skeletons
 * visible. Reading localStorage takes microseconds, so that delay was the only
 * thing standing between a click and the result — it is gone. Skeletons still
 * render on the first paint before the store is seeded; after that the data is
 * simply there.
 */
export async function ready(): Promise<void> {
  await ensureSeeded();
}

export function getStoredSession(scope: SessionScope = "customer"): StoredSession | null {
  const session = readKey<StoredSession | null>(sessionKey(scope), null);
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) return null;
  return session;
}

/** The user signed in to `scope`, or null when signed out / expired / blocked. */
export function getCurrentUser(scope: SessionScope = "customer"): User | null {
  const session = getStoredSession(scope);
  if (!session) return null;
  const user = readCollection<User>("users").find((u) => u.id === session.userId);
  if (!user || user.status !== "ACTIVE") return null;
  return user;
}

/** Throws unless a customer is signed in on the site. Returns the user. */
export function requireUser(): User {
  const user = getCurrentUser("customer");
  if (!user) throw unauthorized();
  return user;
}

/** Throws unless somebody is signed in to the admin panel. */
export function requireAdminUser(): User {
  const user = getCurrentUser("admin");
  if (!user) throw unauthorized("Sign in to the admin panel to do that.");
  return user;
}

/**
 * Throws unless the admin session holds `permission`. Services call this
 * before every admin mutation, so a hidden button is never the only guard.
 */
export function requirePermission(permission: Permission): User {
  const user = requireAdminUser();
  if (!can(user, permission)) {
    throw forbidden(
      `You do not have permission to manage ${permission.toLowerCase()}.`,
    );
  }
  return user;
}

/** Throws unless the admin session belongs to the super admin. */
export function requireSuperAdmin(): User {
  const user = requireAdminUser();
  if (!canManageStaff(user)) {
    throw forbidden("Only the super admin can manage staff.");
  }
  return user;
}

/**
 * Whoever is performing an action that both sides can perform — cancelling an
 * order, for instance. The admin panel wins when it is signed in and allowed,
 * otherwise it is the customer's own doing.
 */
export function requireActor(permission: Permission): User {
  const admin = getCurrentUser("admin");
  if (admin && can(admin, permission)) return admin;
  return requireUser();
}

/** Appends to the admin activity log, newest first, capped to keep storage small. */
export function logActivity(
  by: Pick<User, "id" | "name">,
  action: string,
  summary: string,
  entityId?: string,
): void {
  const entry: ActivityLogEntry = {
    id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    byUserId: by.id,
    byName: by.name,
    action,
    summary,
    entityId,
  };
  const rows = readCollection<ActivityLogEntry>("activityLog");
  writeCollection("activityLog", [entry, ...rows].slice(0, 200), "create", entry.id);
}

/** Short unique id for records the admin creates at runtime. */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Case/space-insensitive slug, used for menu items and categories. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
