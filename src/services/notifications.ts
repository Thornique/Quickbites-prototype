import { can } from "@/lib/permissions";
import {
  notificationPrefsKey,
  readCollection,
  readKey,
  writeCollection,
  writeKey,
} from "@/storage";
import type {
  AppNotification,
  NotificationParams,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
  OutletId,
  Permission,
  User,
} from "@/types";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/types";
import { getCurrentUser, newId, ready } from "./common";
import { assignedOutletOf } from "./outlets";

/**
 * In-app notifications.
 *
 * Rows are deliberately tiny: a type, a few params and a link. The visible
 * title and body are rendered from the i18n dictionaries at display time, so
 * nothing has to be re-translated when the reader switches language and the
 * whole collection stays in the low kilobytes.
 */

/** Per user. Oldest read rows are dropped first when this is exceeded. */
const MAX_PER_USER = 50;

function readAll(): AppNotification[] {
  return readCollection<AppNotification>("notifications");
}

/** Trims to the cap, dropping read rows before unread ones. */
function trimForUser(rows: AppNotification[], userId: string): AppNotification[] {
  const mine = rows.filter((n) => n.recipientUserId === userId);
  if (mine.length <= MAX_PER_USER) return rows;

  const sorted = [...mine].sort((a, b) => {
    // Unread survives read; within each group, newest survives.
    if (!!a.readAt !== !!b.readAt) return a.readAt ? 1 : -1;
    return b.createdAt - a.createdAt;
  });
  const keep = new Set(sorted.slice(0, MAX_PER_USER).map((n) => n.id));
  return rows.filter((n) => n.recipientUserId !== userId || keep.has(n.id));
}

export interface NotifyInput {
  userId: string;
  /** The outlet the alert concerns. Unset for account-wide messages. */
  outletId?: OutletId;
  type: NotificationType;
  params?: NotificationParams;
  link?: string;
  priority?: NotificationPriority;
  /** Makes the notification fire at most once for this user. */
  dedupeKey?: string;
}

/**
 * Creates one notification. Synchronous because it is called from inside
 * other service mutations, which have already awaited `ready()`.
 */
export function notify({
  userId,
  outletId,
  type,
  params = {},
  link,
  priority = "normal",
  dedupeKey,
}: NotifyInput): AppNotification | null {
  const rows = readAll();

  if (dedupeKey) {
    const exists = rows.some(
      (n) => n.recipientUserId === userId && n.dedupeKey === dedupeKey,
    );
    if (exists) return null;
  }

  const notification: AppNotification = {
    id: newId("ntf"),
    recipientUserId: userId,
    outletId,
    type,
    params,
    link,
    priority,
    createdAt: Date.now(),
    dedupeKey,
  };

  writeCollection(
    "notifications",
    trimForUser([notification, ...rows], userId),
    "create",
    notification.id,
  );
  return notification;
}

/**
 * Notifies every admin who holds `permission` at the outlet the alert is
 * about, plus the super admin, who covers both outlets.
 *
 * Fanning out one row per recipient keeps read state honest — marking a new
 * order as seen must not clear it for the other person on shift. Scoping by
 * outlet is what stops the restaurant manager being paged about a latte.
 */
export function notifyAdmins(
  permission: Permission,
  input: Omit<NotifyInput, "userId">,
): number {
  const recipients = readCollection<User>("users").filter((user) => {
    if (user.status !== "ACTIVE") return false;
    if (user.role === "SUPER_ADMIN") return true;
    if (user.role !== "ADMIN" || !can(user, permission)) return false;
    const assigned = assignedOutletOf(user);
    // An alert with no outlet concerns the whole business, so everyone gets it.
    return !input.outletId || !assigned || assigned === input.outletId;
  });

  let sent = 0;
  for (const user of recipients) {
    if (notify({ ...input, userId: user.id })) sent += 1;
  }
  return sent;
}

export interface ListOptions {
  unreadOnly?: boolean;
  limit?: number;
  /** Narrows to one outlet; account-wide rows (no outlet) always show. */
  outletId?: OutletId;
}

export async function list(
  userId: string,
  options: ListOptions = {},
): Promise<AppNotification[]> {
  await ready();
  return listSync(userId, options);
}

/** Synchronous read for the bell, which re-reads on every sync event. */
export function listSync(
  userId: string,
  { unreadOnly = false, limit, outletId }: ListOptions = {},
): AppNotification[] {
  const rows = readAll()
    .filter((n) => n.recipientUserId === userId)
    .filter((n) => !outletId || !n.outletId || n.outletId === outletId)
    .filter((n) => (unreadOnly ? !n.readAt : true))
    .sort((a, b) => b.createdAt - a.createdAt);
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
}

export function unreadCount(userId: string, outletId?: OutletId): number {
  return readAll().filter(
    (n) =>
      n.recipientUserId === userId &&
      !n.readAt &&
      (!outletId || !n.outletId || n.outletId === outletId),
  ).length;
}

export async function markRead(id: string): Promise<void> {
  await ready();
  const rows = readAll();
  const at = Date.now();
  writeCollection(
    "notifications",
    rows.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: at } : n)),
    "update",
    id,
  );
}

export async function markAllRead(userId: string): Promise<void> {
  await ready();
  const rows = readAll();
  const at = Date.now();
  writeCollection(
    "notifications",
    rows.map((n) =>
      n.recipientUserId === userId && !n.readAt ? { ...n, readAt: at } : n,
    ),
    "update",
  );
}

/** Clears everything for one user — used by the dev reset path. */
export async function clearFor(userId: string): Promise<void> {
  await ready();
  writeCollection(
    "notifications",
    readAll().filter((n) => n.recipientUserId !== userId),
    "delete",
  );
}

/* ---------------------------------------------------------------- */
/* Preferences                                                       */
/* ---------------------------------------------------------------- */

export function getPreferences(userId?: string): NotificationPreferences {
  const id = userId ?? getCurrentUser()?.id;
  if (!id) return DEFAULT_NOTIFICATION_PREFERENCES;
  return readKey<NotificationPreferences>(
    notificationPrefsKey(id),
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
}

export function setPreferences(
  patch: Partial<NotificationPreferences>,
  userId?: string,
): NotificationPreferences {
  const id = userId ?? getCurrentUser()?.id;
  if (!id) return DEFAULT_NOTIFICATION_PREFERENCES;
  const next = { ...getPreferences(id), ...patch };
  writeKey(notificationPrefsKey(id), next);
  return next;
}
