import { forbidden, unauthorized } from "@/lib/errors";
import { can, canManageStaff } from "@/lib/permissions";
import {
  SESSION_KEY,
  ensureSeeded,
  readCollection,
  readKey,
  writeCollection,
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
 * Artificial latency so loading skeletons are actually visible during the
 * demo. Kept short enough that the app never feels broken.
 */
export function delay(min = 150, max = 350): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Every read/write path awaits this so the store is seeded before use. */
export async function ready(withDelay = true): Promise<void> {
  await ensureSeeded();
  if (withDelay) await delay();
}

export function getStoredSession(): StoredSession | null {
  const session = readKey<StoredSession | null>(SESSION_KEY, null);
  if (!session) return null;
  if (Date.parse(session.expiresAt) <= Date.now()) return null;
  return session;
}

/**
 * Development-only "act as" override, used by the demo controls on /dev/data
 * until the admin board lands.
 *
 * It lives in memory and only in this tab, so running an admin action never
 * rewrites the shared session key — the customer stays signed in in the other
 * tab and watches their order change live. One action at a time (the panel
 * disables its buttons while a call is in flight).
 */
let actingUserId: string | null = null;

export async function actingAs<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  const previous = actingUserId;
  actingUserId = userId;
  try {
    return await fn();
  } finally {
    actingUserId = previous;
  }
}

/** The signed-in user record, or null when signed out / expired / blocked. */
export function getCurrentUser(): User | null {
  const users = readCollection<User>("users");

  if (actingUserId) {
    const acting = users.find((u) => u.id === actingUserId);
    if (acting && acting.status === "ACTIVE") return acting;
  }

  const session = getStoredSession();
  if (!session) return null;
  const user = users.find((u) => u.id === session.userId);
  if (!user || user.status !== "ACTIVE") return null;
  return user;
}

/** Throws unless somebody is signed in. Returns the user. */
export function requireUser(): User {
  const user = getCurrentUser();
  if (!user) throw unauthorized();
  return user;
}

/**
 * Throws unless the signed-in user holds `permission`. Services call this
 * before every admin mutation, so a hidden button is never the only guard.
 */
export function requirePermission(permission: Permission): User {
  const user = requireUser();
  if (!can(user, permission)) {
    throw forbidden(
      `You do not have permission to manage ${permission.toLowerCase()}.`,
    );
  }
  return user;
}

/** Throws unless the signed-in user is the super admin. */
export function requireSuperAdmin(): User {
  const user = requireUser();
  if (!canManageStaff(user)) {
    throw forbidden("Only the super admin can manage staff.");
  }
  return user;
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
