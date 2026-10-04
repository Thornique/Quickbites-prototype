"use client";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  NotificationList,
  NotificationPreferences,
  useNotificationActions,
  useNotifications,
} from "@/features/notifications";
import { useAdminOutlet } from "@/features/outlet";
import { useT } from "@/i18n";

/** Full notification history for the signed-in admin. */
export default function AdminNotificationsPage() {
  const t = useT();
  // Narrowed to the outlet being run, so a coffee alert stays on coffee.
  const { data: notifications, isLoading } = useNotifications(
    undefined,
    useAdminOutlet().outletId,
  );
  const { markRead, markAllRead } = useNotificationActions();
  const hasUnread = (notifications ?? []).some((n) => !n.readAt);

  return (
    <>
      <PageHeader
        title={t.notifications.title}
        description={t.notifications.adminSubtitle}
        actions={
          hasUnread && (
            <Button variant="outline" size="sm" onClick={() => markAllRead()}>
              {t.notifications.markAllRead}
            </Button>
          )
        }
      />

      <div className="overflow-hidden rounded-card border border-hairline bg-surface">
        <NotificationList
          notifications={notifications ?? []}
          isLoading={isLoading}
          onItemClick={(n) => markRead(n.id)}
        />
      </div>

      <NotificationPreferences className="mt-6 max-w-xl" />
    </>
  );
}
