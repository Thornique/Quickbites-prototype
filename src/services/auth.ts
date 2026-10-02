import { sha256Hex, verifyPassword } from "@/lib/crypto";
import { conflict, forbidden, invalid, notFound, unauthorized } from "@/lib/errors";
import { isAdminRole } from "@/lib/permissions";
import {
  readCollection,
  removeKey,
  sessionKey,
  writeCollection,
  writeKey,
  type SessionScope,
} from "@/storage";
import type { SessionUser, User } from "@/types";
import {
  getCurrentUser,
  getStoredSession,
  newId,
  nowIso,
  ready,
  type StoredSession,
} from "./common";

const SESSION_DAYS = 7;

function toSessionUser(user: User): SessionUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

function startSession(user: User, scope: SessionScope): SessionUser {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
  const session: StoredSession = { userId: user.id, role: user.role, expiresAt };
  writeKey(sessionKey(scope), session);

  const users = readCollection<User>("users");
  writeCollection(
    "users",
    users.map((u) => (u.id === user.id ? { ...u, lastLoginAt: nowIso() } : u)),
    "update",
    user.id,
  );

  return toSessionUser(user);
}

function findByEmail(email: string): User | undefined {
  const normalised = email.trim().toLowerCase();
  return readCollection<User>("users").find(
    (u) => u.email.toLowerCase() === normalised,
  );
}

export interface SignUpInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export async function signUp(input: SignUpInput): Promise<SessionUser> {
  await ready();

  if (findByEmail(input.email)) {
    throw conflict(
      "An account with this email already exists. Try signing in instead.",
    );
  }

  const user: User = {
    id: newId("user"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    passwordHash: await sha256Hex(input.password),
    role: "CUSTOMER",
    permissions: [],
    status: "ACTIVE",
    createdAt: nowIso(),
  };

  const users = readCollection<User>("users");
  writeCollection("users", [...users, user], "create", user.id);
  return startSession(user, "customer");
}

/**
 * Customer sign-in, on the public site. An admin account may sign in here too
 * and shop like anyone else — that is a customer session, separate from any
 * admin session the same person has open elsewhere.
 */
export async function signIn(email: string, password: string): Promise<SessionUser> {
  await ready();

  const user = findByEmail(email);
  // Same message either way, so the form never confirms which emails exist.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw unauthorized("That email and password do not match.");
  }
  if (user.status === "BLOCKED") {
    throw forbidden("This account has been blocked. Please contact the store.");
  }
  if (user.status === "INACTIVE") {
    throw forbidden("This account is deactivated.");
  }

  return startSession(user, "customer");
}

/** Admin sign-in, under /admin — refuses customer accounts with a clear message. */
export async function signInAsAdmin(
  email: string,
  password: string,
): Promise<SessionUser> {
  await ready();

  const user = findByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw unauthorized("That email and password do not match.");
  }
  if (!isAdminRole(user.role)) {
    throw forbidden("This account doesn't have admin access.");
  }
  if (user.status !== "ACTIVE") {
    throw forbidden("This admin account is not active.");
  }

  return startSession(user, "admin");
}

/** Signs out of one side of the app only — the other session is untouched. */
export async function signOut(scope: SessionScope = "customer"): Promise<void> {
  removeKey(sessionKey(scope));
}

/** Current user without the hash, or null. Does not add artificial latency. */
export async function getSession(
  scope: SessionScope = "customer",
): Promise<SessionUser | null> {
  await ready(false);
  const user = getCurrentUser(scope);
  return user ? toSessionUser(user) : null;
}

/** Synchronous read for guards that must decide before paint. */
export function peekSession(scope: SessionScope = "customer"): StoredSession | null {
  return getStoredSession(scope);
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

export async function updateProfile(
  input: UpdateProfileInput,
  scope: SessionScope = "customer",
): Promise<SessionUser> {
  await ready();
  const current = getCurrentUser(scope);
  if (!current) throw unauthorized();

  const users = readCollection<User>("users");
  const updated = users.map((u) =>
    u.id === current.id
      ? {
          ...u,
          name: input.name?.trim() || u.name,
          phone: input.phone?.trim() || u.phone,
          updatedAt: nowIso(),
        }
      : u,
  );
  writeCollection("users", updated, "update", current.id);

  const next = updated.find((u) => u.id === current.id);
  if (!next) throw notFound("Account");
  return toSessionUser(next);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  scope: SessionScope = "customer",
): Promise<void> {
  await ready();
  const user = getCurrentUser(scope);
  if (!user) throw unauthorized();

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw invalid("Your current password is not correct.", "currentPassword");
  }

  const hash = await sha256Hex(newPassword);
  const users = readCollection<User>("users");
  writeCollection(
    "users",
    users.map((u) =>
      u.id === user.id ? { ...u, passwordHash: hash, updatedAt: nowIso() } : u,
    ),
    "update",
    user.id,
  );
}
