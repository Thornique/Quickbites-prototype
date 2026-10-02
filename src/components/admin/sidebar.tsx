"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/features/auth";
import { useT } from "@/i18n";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, type AdminNavItem } from "./nav-items";

/**
 * Admin navigation.
 *
 * Entries the signed-in admin has no permission for are not rendered at all —
 * a disabled link to a page that will 403 teaches nothing. The URL is still
 * guarded, so typing it shows the in-shell 403.
 */
export function AdminSidebar({
  isCollapsed,
  onToggle,
  onNavigate,
  className,
}: {
  isCollapsed: boolean;
  /** Omitted inside the mobile sheet, which has no collapse control. */
  onToggle?: () => void;
  /** Closes the mobile sheet after a link is followed. */
  onNavigate?: () => void;
  className?: string;
}) {
  const t = useT();
  const pathname = usePathname();
  const { user, isSuperAdmin } = useSession();

  const isVisible = (item: AdminNavItem) =>
    item.superAdminOnly
      ? isSuperAdmin
      : item.permission
        ? can(user, item.permission)
        : true;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav
      aria-label={t.adm.nav.sections}
      className={cn("flex h-full flex-col gap-1 overflow-y-auto py-3", className)}
    >
      {ADMIN_NAV.map((group) => {
        const items = group.items.filter(isVisible);
        if (items.length === 0) return null;

        return (
          <div key={group.labelKey} className="px-2 py-1.5">
            {/* The group label is the only thing the icon rail drops. */}
            {!isCollapsed && (
              <p className="px-2 pb-1 text-[0.6875rem] font-bold tracking-[0.1em] text-ink-muted/80 uppercase">
                {t.adm.nav[group.labelKey]}
              </p>
            )}

            <ul className="grid gap-0.5">
              {items.map((item) => {
                const active = isActive(item.href);
                const label = t.adm.nav[item.labelKey];

                const link = (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-control px-2 py-2 text-sm font-medium transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
                      active
                        ? "bg-brand/8 text-brand"
                        : "text-ink-muted hover:bg-sand-100 hover:text-ink",
                      isCollapsed && "justify-center px-0",
                    )}
                  >
                    <item.icon
                      size={18}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="shrink-0"
                    />
                    {isCollapsed ? (
                      <span className="sr-only">{label}</span>
                    ) : (
                      <span className="truncate">{label}</span>
                    )}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right">{label}</TooltipContent>
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={isCollapsed ? t.adm.nav.expand : t.adm.nav.collapse}
          className={cn(
            "mx-2 mt-auto flex items-center gap-2.5 rounded-control px-2 py-2 text-sm font-medium",
            "text-ink-muted transition-colors hover:bg-sand-100 hover:text-ink",
            "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
            isCollapsed && "justify-center px-0",
          )}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>{t.adm.nav.collapse}</span>
            </>
          )}
        </button>
      )}
    </nav>
  );
}
