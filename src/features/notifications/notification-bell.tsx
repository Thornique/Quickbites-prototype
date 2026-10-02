"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types";
import { useNotificationActions, useNotifications, useUnreadCount } from "./index";
import { NotificationList } from "./notification-list";

export interface NotificationBellProps {
  /** Where "See all" goes — customers and admins have different pages. */
  allHref?: string;
  className?: string;
}

export function NotificationBell({
  allHref = "/account/notifications",
  className,
}: NotificationBellProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications(12);
  const { data: unread = 0 } = useUnreadCount();
  const { markRead, markAllRead } = useNotificationActions();

  const handleClick = (notification: AppNotification) => {
    markRead(notification.id);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={
            unread > 0
              ? `${t.notifications.open}, ${t.notifications.unreadCount(unread)}`
              : t.notifications.open
          }
          className={cn(
            "relative inline-flex size-10 shrink-0 items-center justify-center rounded-control",
            "border border-hairline bg-surface text-ink transition-colors",
            "hover:border-brand hover:text-brand",
            "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
            className,
          )}
        >
          <Bell size={20} strokeWidth={1.75} aria-hidden="true" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="nums absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-pill bg-brand px-1 py-0.5 text-[0.6875rem] font-bold text-white"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(22rem,92vw)] p-0">
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
          <p className="text-sm font-semibold text-ink">{t.notifications.label}</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="rounded-control px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 focus-visible:ring-2 focus-visible:ring-brand"
            >
              {t.notifications.markAllRead}
            </button>
          )}
        </div>

        <div className="max-h-[22rem] overflow-y-auto">
          <NotificationList
            notifications={notifications ?? []}
            isLoading={isLoading}
            onItemClick={handleClick}
            dense
          />
        </div>

        <div className="border-t border-hairline p-2">
          <Link
            href={allHref}
            onClick={() => setIsOpen(false)}
            className="block rounded-control px-3 py-2 text-center text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
          >
            {t.notifications.seeAll}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
