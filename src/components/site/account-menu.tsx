"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, Receipt, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession, useSessionActions, useSessionScope } from "@/features/auth";
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
 * Header account control. Signed out it is a plain "Sign in" button; signed in
 * it becomes an initials avatar with the account menu.
 *
 * It follows the surrounding session scope: on the site it is the customer's
 * menu (with a shortcut into the panel for admins), inside /admin it is the
 * admin's, and signing out of one leaves the other alone.
 */
export interface AccountMenuProps {
  className?: string;
  /** Shows a text label beside the avatar, as in the desktop header row. */
  showLabel?: boolean;
}

export function AccountMenu({ className, showLabel = false }: AccountMenuProps) {
  const t = useT();
  const router = useRouter();
  const scope = useSessionScope();
  const { user, isReady, isAdmin } = useSession();
  const { signOut } = useSessionActions();

  const isAdminScope = scope === "admin";
  const signInHref = isAdminScope ? "/admin/login" : "/login";

  // Reserve the space so the header does not jump when the session resolves.
  if (!isReady) {
    return <Skeleton className={cn("size-10 rounded-full", className)} />;
  }

  if (!user) {
    if (showLabel) {
      return (
        <Link
          href={signInHref}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-control px-2",
            "text-sm font-bold tracking-wide text-ink uppercase transition-colors",
            "hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
            className,
          )}
        >
          <UserIcon size={20} strokeWidth={1.75} aria-hidden="true" />
          {t.account.signIn}
        </Link>
      );
    }
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href={signInHref}>{t.account.signIn}</Link>
      </Button>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success(t.auth.signedOut);
    router.push(isAdminScope ? "/admin/login" : "/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t.account.accountMenu}
          className={cn(
            "inline-flex h-10 shrink-0 items-center rounded-full transition-colors",
            "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
            showLabel &&
              "gap-2 rounded-control pr-2 text-sm font-bold tracking-wide text-ink uppercase hover:text-brand",
            className,
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand transition-colors",
              showLabel ? "size-9" : "size-10 hover:bg-brand/15",
            )}
          >
            {initialsOf(user.name, user.email)}
          </span>
          {showLabel && (
            <span aria-hidden="true" className="max-w-28 truncate">
              {user.name.split(" ")[0]}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="normal-case">
          <span className="block text-sm font-semibold text-ink">{user.name}</span>
          <span className="block truncate text-xs font-normal text-ink-muted">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isAdminScope ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard aria-hidden="true" />
              {t.admin.dashboard}
            </Link>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/account/orders">
                <Receipt aria-hidden="true" />
                {t.account.myOrders}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/profile">
                <UserIcon aria-hidden="true" />
                {t.account.profile}
              </Link>
            </DropdownMenuItem>

            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <LayoutDashboard aria-hidden="true" />
                    {t.account.openAdminPanel}
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          {t.account.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
