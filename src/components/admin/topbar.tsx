"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu as MenuIcon } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/sidebar";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Wordmark } from "@/components/site/wordmark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useSession, useSessionActions } from "@/features/auth";
import { NotificationBell } from "@/features/notifications";
import { useOpenState, useSettings } from "@/features/settings";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { can } from "@/lib/permissions";
import { setAcceptingOrders, setStoreOpen } from "@/services/settings";
import { cn } from "@/lib/utils";

/** "Sunita Deshmukh" -> "SD". */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * The two switches that stop the day. Only admins holding SETTINGS may touch
 * them; everyone else sees the state as plain text, because whether the shop
 * is open is information the whole team needs.
 */
function StoreSwitches() {
  const t = useT();
  const { user } = useSession();
  const { data: settings } = useSettings();
  const { data: openState } = useOpenState();
  const [isSaving, setIsSaving] = useState(false);

  const mayEdit = can(user, "SETTINGS");
  if (!settings) return null;

  const run = async (action: () => Promise<unknown>, message: string) => {
    setIsSaving(true);
    try {
      await action();
      toast.success(message);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsSaving(false);
    }
  };

  const rows = [
    {
      id: "store-open",
      checked: settings.isOpen,
      label: settings.isOpen ? t.adm.shell.storeOpen : t.adm.shell.storeClosed,
      tone: settings.isOpen,
      onChange: (next: boolean) =>
        run(
          () => setStoreOpen(next),
          next ? t.adm.shell.openSaved : t.adm.shell.closedSaved,
        ),
    },
    {
      id: "accepting-orders",
      checked: settings.acceptingOrders,
      label: settings.acceptingOrders
        ? t.adm.shell.acceptingOrders
        : t.adm.shell.ordersPaused,
      tone: settings.acceptingOrders,
      onChange: (next: boolean) =>
        run(
          () => setAcceptingOrders(next),
          next ? t.adm.shell.acceptingSaved : t.adm.shell.pausedSaved,
        ),
    },
  ];

  return (
    // Shown from `lg`, the same breakpoint as the sidebar: at `md` the two
    // labelled switches plus the bell, language toggle and avatar overflow the
    // bar. Tablet admins reach the same two toggles in Settings.
    <div className="hidden items-center gap-4 lg:flex">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2">
          {mayEdit ? (
            <Switch
              id={row.id}
              checked={row.checked}
              disabled={isSaving}
              onCheckedChange={(next) => void row.onChange(next)}
              aria-label={row.label}
            />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                row.tone ? "bg-veg" : "bg-ink-muted/40",
              )}
            />
          )}
          <label
            htmlFor={mayEdit ? row.id : undefined}
            className={cn(
              "text-xs font-semibold whitespace-nowrap",
              row.tone ? "text-ink" : "text-ink-muted",
            )}
          >
            {row.label}
          </label>
        </div>
      ))}
      {openState && !openState.isOpen && (
        <Badge variant="warning">{t.adm.shell.storeClosed}</Badge>
      )}
    </div>
  );
}

export function AdminTopbar({
  isCollapsed,
  onToggleCollapsed,
}: {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const { user, isSuperAdmin } = useSession();
  const { signOut } = useSessionActions();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success(t.auth.signedOut);
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface">
      <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
        {/* Mobile: the whole sidebar in a sheet. */}
        <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={t.adm.nav.openNav}
            >
              <MenuIcon aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="border-b border-hairline px-4 py-3 text-sm">
              {t.adm.nav.sections}
            </SheetTitle>
            <AdminSidebar isCollapsed={false} onNavigate={() => setIsNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link href="/admin" className="shrink-0" aria-label={t.admin.panel}>
          <Wordmark className="h-4 sm:h-5" />
        </Link>
        <Badge variant="muted" className="hidden sm:inline-flex">
          {t.admin.panel}
        </Badge>
        {/* Nobody should mistake the demo for the live till. */}
        <Badge variant="warning" title={t.common.prototypeNote}>
          {t.common.prototype}
        </Badge>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <StoreSwitches />

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink xl:inline-flex"
          >
            {t.admin.viewSite}
            <ExternalLink size={14} aria-hidden="true" />
          </Link>

          <NotificationBell allHref="/admin/notifications" />
          <LanguageToggle className="hidden sm:inline-flex" />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t.adm.shell.profileMenu}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-xs font-semibold text-ink transition-colors hover:bg-ink/10 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  {initialsOf(user.name)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="normal-case">
                  <span className="block text-sm font-semibold text-ink">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs font-normal text-ink-muted">
                    {user.email}
                  </span>
                  <Badge
                    variant={isSuperAdmin ? "default" : "secondary"}
                    className="mt-2"
                  >
                    {t.roles[user.role]}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/notifications">{t.notifications.preferences}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="lg:hidden"
                  onSelect={(event) => {
                    event.preventDefault();
                    onToggleCollapsed();
                  }}
                >
                  {isCollapsed ? t.adm.nav.expand : t.adm.nav.collapse}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => void handleSignOut()}
                >
                  <LogOut aria-hidden="true" />
                  {t.account.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
