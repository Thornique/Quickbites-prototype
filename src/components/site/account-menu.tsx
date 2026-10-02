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
import { useSession } from "@/features/auth";
import { useT } from "@/i18n";
import { useSessionStore } from "@/store/session";
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
 * it becomes an initials avatar with the account menu. Admins additionally get
 * a link into the admin panel so they do not have to type the URL.
 */
export function AccountMenu({ className }: { className?: string }) {
  const t = useT();
  const router = useRouter();
  const { user, isReady, isAdmin } = useSession();
  const signOut = useSessionStore((s) => s.signOut);

  // Reserve the space so the header does not jump when the session resolves.
  if (!isReady) {
    return <Skeleton className={cn("size-10 rounded-full", className)} />;
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href="/login">{t.account.signIn}</Link>
      </Button>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success(t.auth.signedOut);
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t.account.accountMenu}
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
            "bg-brand/10 text-sm font-semibold text-brand transition-colors",
            "hover:bg-brand/15 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
            className,
          )}
        >
          {initialsOf(user.name, user.email)}
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

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          {t.account.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
