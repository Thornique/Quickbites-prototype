"use client";

import {
  NotificationList,
  useNotificationActions,
  useNotifications,
} from "@/features/notifications";
import { useT } from "@/i18n";

/** Full notification history for the signed-in customer. */
export default function AccountNotificationsPage() {
  const t = useT();
  const { data: notifications, isLoading } = useNotifications();
  const { markRead, markAllRead } = useNotificationActions();
  const hasUnread = (notifications ?? []).some((n) => !n.readAt);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
            {t.notifications.title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{t.notifications.subtitle}</p>
        </div>
        {hasUnread && (
          <button
            type="button"
            onClick={() => markAllRead()}
            className="rounded-control border border-hairline px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t.notifications.markAllRead}
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-card border border-hairline bg-surface">
        <NotificationList
          notifications={notifications ?? []}
          isLoading={isLoading}
          onItemClick={(n) => markRead(n.id)}
        />
      </div>
    </div>
  );
}
