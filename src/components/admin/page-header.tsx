"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { matchNavItem } from "./nav-items";

/**
 * Breadcrumbs derived from the nav model, so a new page gets its trail for
 * free as soon as it appears in ADMIN_NAV.
 */
export function AdminBreadcrumbs({ className }: { className?: string }) {
  const t = useT();
  const pathname = usePathname();
  const item = matchNavItem(pathname);
  const isRoot = pathname === "/admin";

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1", className)}>
      <Link
        href="/admin"
        className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
      >
        {t.adm.shell.breadcrumbHome}
      </Link>
      {!isRoot && item && (
        <>
          <ChevronRight
            size={13}
            className="shrink-0 text-ink-muted/60"
            aria-hidden="true"
          />
          <span className="text-xs font-semibold text-ink">
            {t.adm.nav[item.labelKey]}
          </span>
        </>
      )}
    </nav>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Buttons, toggles or a date range control, right-aligned. */
  actions?: React.ReactNode;
  /** Tabs or filters that belong to the page, below the title row. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Title block for every admin page. Smaller and calmer than the storefront's
 * display headings — a back office is read all day, not scanned once.
 */
export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-5", className)}>
      <AdminBreadcrumbs className="mb-2" />
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="measure mt-1 text-sm text-ink-muted">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
