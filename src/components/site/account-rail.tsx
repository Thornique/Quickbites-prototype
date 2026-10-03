"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Clock, Receipt, User as UserIcon } from "lucide-react";
import { useSession } from "@/features/auth";
import { useUnreadCount } from "@/features/notifications";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

/** "Rohit Verma" -> "RV"; falls back to the first letter of an email. */
function initialsOf(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return email.slice(0, 1).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * The left column of every /account page: who is signed in, then the sections
 * as a stacked list of cards.
 *
 * It is a rail rather than a row of tabs because the list keeps growing —
 * orders, notifications, profile — and tabs would start wrapping. On a phone
 * it sits above the content and scrolls with it.
 */
export function AccountRail() {
  const t = useT();
  const pathname = usePathname();
  const { user } = useSession();
  const { data: unread = 0 } = useUnreadCount();

  if (!user) return null;

  const items = [
    { href: "/account", label: t.accountPage.overview, Icon: Clock },
    { href: "/account/orders", label: t.account.myOrders, Icon: Receipt },
    {
      href: "/account/notifications",
      label: t.notifications.label,
      Icon: Bell,
      badge: unread,
    },
    { href: "/account/profile", label: t.account.profile, Icon: UserIcon },
  ];

  return (
    <div className="grid gap-3">
      {/* Who you are. Links to the profile form, like the card on the chains' sites. */}
      <Link
        href="/account/profile"
        className="flex items-center gap-3 rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-base font-bold text-brand"
        >
          {initialsOf(user.name, user.email)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-display block truncate text-lg text-ink uppercase">
            {user.name}
          </span>
          <span className="block truncate text-xs text-ink-muted">{user.email}</span>
        </span>
        <ChevronRight
          size={18}
          strokeWidth={1.75}
          aria-hidden="true"
          className="shrink-0 text-ink-muted"
        />
      </Link>

      <nav aria-label={t.accountPage.overview} className="grid gap-2">
        {items.map(({ href, label, Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-card border px-4 py-3 text-sm font-bold transition-colors",
                "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                isActive
                  ? "border-cocoa bg-cocoa text-white"
                  : "border-hairline bg-surface text-ink hover:border-brand/40 hover:text-brand",
              )}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="nums inline-flex min-w-5 shrink-0 items-center justify-center rounded-pill bg-brand px-1.5 py-0.5 text-xs font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
