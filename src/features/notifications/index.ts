"use client";

import { useCallback } from "react";
import {
  getPreferences,
  listSync,
  markAllRead,
  markRead,
  setPreferences,
  unreadCount,
} from "@/services/notifications";
import { useSessionUser } from "@/features/auth";
import { useStoreQuery } from "../use-store-query";
import type { AppNotification, NotificationPreferences } from "@/types";

/** The signed-in user's notifications, re-read on every cross-tab write. */
export function useNotifications(limit?: number) {
  const user = useSessionUser();
  const userId = user?.id ?? "";
  return useStoreQuery<AppNotification[]>(
    async () => (userId ? listSync(userId, { limit }) : []),
    ["notifications"],
    [userId, limit],
  );
}

export function useUnreadCount() {
  const user = useSessionUser();
  const userId = user?.id ?? "";
  return useStoreQuery<number>(
    async () => (userId ? unreadCount(userId) : 0),
    ["notifications"],
    [userId],
  );
}

export function useNotificationActions() {
  const user = useSessionUser();
  const userId = user?.id;

  return {
    markRead: useCallback((id: string) => void markRead(id), []),
    markAllRead: useCallback(() => {
      if (userId) void markAllRead(userId);
    }, [userId]),
  };
}

export function useNotificationPreferences(): {
  preferences: NotificationPreferences;
  update: (patch: Partial<NotificationPreferences>) => void;
} {
  const user = useSessionUser();
  const userId = user?.id;

  return {
    preferences: getPreferences(userId),
    update: useCallback(
      (patch: Partial<NotificationPreferences>) => {
        setPreferences(patch, userId);
      },
      [userId],
    ),
  };
}

export { NotificationBell } from "./notification-bell";
export { NotificationList } from "./notification-list";
export { NotificationPreferences } from "./notification-preferences";
export { NotificationWatcher } from "./notification-watcher";
