"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n";
import { can, isAdminRole } from "@/lib/permissions";
import type { Permission } from "@/types";
import { useSession } from "./use-session";

/** Builds /login?next=<current url> so the reader comes back where they were. */
export function loginHref(pathname: string, search?: string): string {
  const target = search ? `${pathname}?${search}` : pathname;
  return `/login?next=${encodeURIComponent(target)}`;
}

/** Shown while the session is being read, so no wrong page is ever painted. */
function AccessSkeleton({ label }: { label: string }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-20" aria-busy="true">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-8 h-10 w-40" />
    </div>
  );
}

/**
 * Customer-only areas (/checkout, /account/*). Redirects signed-out visitors
 * to /login?next=… rather than showing them an empty page.
 */
export function RequireCustomer({ children }: { children: React.ReactNode }) {
  const t = useT();
  const router = useRouter();
  const { user, isReady } = useSession();

  const isSignedOut = isReady && !user;

  useEffect(() => {
    if (!isSignedOut) return;
    /*
      Read the query string from the browser rather than useSearchParams():
      that hook opts the whole route out of static prerendering, and this
      redirect only ever runs on the client anyway.
    */
    const { pathname, search } = window.location;
    router.replace(loginHref(pathname, search.replace(/^\?/, "")));
  }, [isSignedOut, router]);

  if (!isReady || isSignedOut) {
    return <AccessSkeleton label={t.guard.checkingAccess} />;
  }

  return <>{children}</>;
}

export interface RequireAdminProps {
  children: React.ReactNode;
  /**
   * Module this page needs. Omit for pages any admin may open (the dashboard).
   * SUPER_ADMIN passes regardless.
   */
  permission?: Permission;
  /** Restricts the page to the single super admin (Staff). */
  superAdminOnly?: boolean;
}

/**
 * Admin areas. A signed-out or non-admin visitor is sent to /admin/login, but
 * an admin who simply lacks one permission stays inside the shell and gets a
 * proper 403 — being bounced to a login screen you are already past is
 * confusing and hides the real reason.
 */
export function RequireAdmin({
  children,
  permission,
  superAdminOnly = false,
}: RequireAdminProps) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isReady } = useSession();

  const isAdmin = !!user && isAdminRole(user.role);
  const mustSignIn = isReady && !isAdmin;

  useEffect(() => {
    if (!mustSignIn) return;
    router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [mustSignIn, pathname, router]);

  if (!isReady || mustSignIn) {
    return <AccessSkeleton label={t.guard.checkingAccess} />;
  }

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const allowed = superAdminOnly
    ? isSuperAdmin
    : permission
      ? can(user, permission)
      : true;

  if (!allowed) {
    const moduleLabel = superAdminOnly
      ? t.admin.staff
      : permission
        ? t.permissions[permission]
        : t.admin.panel;
    return <Forbidden moduleLabel={moduleLabel} />;
  }

  return <>{children}</>;
}

/** 403 rendered inside the admin shell. */
export function Forbidden({ moduleLabel }: { moduleLabel: string }) {
  const t = useT();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <ShieldX size={26} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h1 className="text-display mt-5 text-2xl text-ink uppercase sm:text-3xl">
        {t.guard.forbiddenTitle}
      </h1>
      <p className="measure mt-2 text-sm text-ink-muted">
        {t.guard.forbiddenBody(moduleLabel)}
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/admin">{t.guard.backToDashboard}</Link>
      </Button>
    </div>
  );
}
