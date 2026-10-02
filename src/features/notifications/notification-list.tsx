"use client";

import Link from "next/link";
import { BellOff } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationCopy, useT } from "@/i18n";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";
import { notificationIcon, notificationTone } from "./notification-icon";

/** "4 min ago" / "7:42 PM" — relative while recent, absolute once it is not. */
function when(createdAt: number, relative: (minutes: number) => string): string {
  const minutes = (Date.now() - createdAt) / 60_000;
  return minutes < 60 ? relative(minutes) : formatTime(createdAt);
}

function isToday(epoch: number): boolean {
  const d = new Date(epoch);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export interface NotificationListProps {
  notifications: AppNotification[];
  isLoading?: boolean;
  onItemClick?: (notification: AppNotification) => void;
  /** Compact rows for the bell dropdown; roomier on the full page. */
  dense?: boolean;
  className?: string;
}

/** Shared renderer for the bell dropdown and the full notification pages. */
export function NotificationList({
  notifications,
  isLoading = false,
  onItemClick,
  dense = false,
  className,
}: NotificationListProps) {
  const t = useT();
  const copyFor = useNotificationCopy();

  if (isLoading) {
    return (
      <div className={cn("space-y-2 p-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        variant="inline"
        icon={BellOff}
        title={t.notifications.emptyTitle}
        description={t.notifications.emptyBody}
        className={className}
      />
    );
  }

  const today = notifications.filter((n) => isToday(n.createdAt));
  const earlier = notifications.filter((n) => !isToday(n.createdAt));

  const renderGroup = (label: string, rows: AppNotification[]) =>
    rows.length === 0 ? null : (
      <li key={label}>
        <p className="px-4 pt-3 pb-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {label}
        </p>
        <ul>
          {rows.map((notification) => {
            const { title, body } = copyFor(notification.type, notification.params);
            const Icon = notificationIcon(notification.type);
            const isUnread = !notification.readAt;

            const content = (
              <>
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                    notificationTone(notification.type),
                  )}
                >
                  <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start gap-2">
                    <span
                      className={cn(
                        "flex-1 text-sm leading-snug",
                        isUnread ? "font-semibold text-ink" : "text-ink-muted",
                      )}
                    >
                      {title}
                    </span>
                    {isUnread && (
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                      />
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{body}</span>
                  <span className="nums mt-1 block text-xs text-ink-muted/80">
                    {when(notification.createdAt, t.notifications.relative)}
                    {isUnread && (
                      <span className="sr-only"> · {t.notifications.unread}</span>
                    )}
                  </span>
                </span>
              </>
            );

            const classes = cn(
              "flex w-full gap-3 px-4 text-left transition-colors hover:bg-sand-50",
              dense ? "py-2.5" : "py-3.5",
              isUnread && "bg-brand/[0.03]",
            );

            return (
              <li
                key={notification.id}
                className="border-b border-hairline last:border-0"
              >
                {notification.link ? (
                  <Link
                    href={notification.link}
                    onClick={() => onItemClick?.(notification)}
                    className={classes}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => onItemClick?.(notification)}
                    className={classes}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </li>
    );

  return (
    <ul className={className}>
      {renderGroup(t.notifications.today, today)}
      {renderGroup(t.notifications.earlier, earlier)}
    </ul>
  );
}
