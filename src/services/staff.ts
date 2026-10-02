import { sha256Hex } from "@/lib/crypto";
import { conflict, forbidden, invalid, notFound } from "@/lib/errors";
import { readCollection, writeCollection } from "@/storage";
import type { ActivityLogEntry, Permission, User } from "@/types";
import { logActivity, newId, nowIso, ready, requireSuperAdmin } from "./common";

/*
  Super-admin rules enforced here, not just in the UI:
  - exactly one SUPER_ADMIN exists
  - the super admin cannot be deleted, deactivated or demoted
  - only the super admin creates or edits admins and their permissions
  - an admin can therefore never grant themselves more permissions
*/

function superAdminOf(users: User[]): User | undefined {
  return users.find((u) => u.role === "SUPER_ADMIN");
}

export async function listStaff(): Promise<User[]> {
  await ready();
  requireSuperAdmin();
  return readCollection<User>("users")
    .filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN")
    .sort((a, b) => (a.role === "SUPER_ADMIN" ? -1 : b.role === "SUPER_ADMIN" ? 1 : 0));
}

export interface CreateAdminInput {
  name: string;
  email: string;
  phone: string;
  /** Temporary password handed to the new admin. */
  password: string;
  permissions: Permission[];
}

export async function createAdmin(input: CreateAdminInput): Promise<User> {
  await ready();
  const owner = requireSuperAdmin();
  const users = readCollection<User>("users");

  const email = input.email.trim().toLowerCase();
  if (!email) throw invalid("An email is required.", "email");
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw conflict("An account with this email already exists.");
  }

  const admin: User = {
    id: newId("user"),
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash: await sha256Hex(input.password),
    role: "ADMIN",
    permissions: input.permissions,
    status: "ACTIVE",
    createdAt: nowIso(),
  };

  writeCollection("users", [...users, admin], "create", admin.id);
  logActivity(owner, "ADMIN_CREATED", `Created admin ${admin.name}`, admin.id);
  return admin;
}

export async function updateAdmin(
  id: string,
  patch: Partial<Pick<User, "name" | "phone" | "permissions" | "status">>,
): Promise<User> {
  await ready();
  const owner = requireSuperAdmin();
  const users = readCollection<User>("users");
  const existing = users.find((u) => u.id === id);
  if (!existing) throw notFound("Admin");

  if (existing.role === "SUPER_ADMIN") {
    if (patch.status && patch.status !== "ACTIVE") {
      throw forbidden("The super admin cannot be deactivated.");
    }
    // Permissions are meaningless for the super admin — they hold everything.
    if (patch.permissions) {
      throw forbidden("The super admin already has every permission.");
    }
  }

  const next: User = {
    ...existing,
    ...patch,
    role: existing.role,
    id,
    updatedAt: nowIso(),
  };
  writeCollection(
    "users",
    users.map((u) => (u.id === id ? next : u)),
    "update",
    id,
  );
  logActivity(owner, "ADMIN_UPDATED", `Updated admin ${next.name}`, id);
  return next;
}

export async function resetAdminPassword(
  id: string,
  newPassword: string,
): Promise<void> {
  await ready();
  const owner = requireSuperAdmin();
  const users = readCollection<User>("users");
  const existing = users.find((u) => u.id === id);
  if (!existing) throw notFound("Admin");

  const passwordHash = await sha256Hex(newPassword);
  writeCollection(
    "users",
    users.map((u) => (u.id === id ? { ...u, passwordHash, updatedAt: nowIso() } : u)),
    "update",
    id,
  );
  logActivity(owner, "ADMIN_PASSWORD_RESET", `Reset password for ${existing.name}`, id);
}

export async function deleteAdmin(id: string): Promise<void> {
  await ready();
  const owner = requireSuperAdmin();
  const users = readCollection<User>("users");
  const existing = users.find((u) => u.id === id);
  if (!existing) throw notFound("Admin");

  if (existing.role === "SUPER_ADMIN")
    throw forbidden("The super admin cannot be deleted.");
  if (existing.id === owner.id) throw forbidden("You cannot delete your own account.");

  writeCollection(
    "users",
    users.filter((u) => u.id !== id),
    "delete",
    id,
  );
  logActivity(owner, "ADMIN_DELETED", `Deleted admin ${existing.name}`, id);
}

/**
 * Guard used by the seed and by any future import: there must be exactly one
 * super admin, and demoting the last one is impossible.
 */
export async function assertSingleSuperAdmin(): Promise<void> {
  await ready(false);
  const users = readCollection<User>("users");
  const supers = users.filter((u) => u.role === "SUPER_ADMIN");
  if (supers.length !== 1) {
    throw conflict(`Expected exactly one super admin, found ${supers.length}.`);
  }
}

export async function getSuperAdmin(): Promise<User> {
  await ready(false);
  const owner = superAdminOf(readCollection<User>("users"));
  if (!owner) throw notFound("Super admin");
  return owner;
}

export async function listActivityLog(limit = 50): Promise<ActivityLogEntry[]> {
  await ready();
  requireSuperAdmin();
  return readCollection<ActivityLogEntry>("activityLog").slice(0, limit);
}
