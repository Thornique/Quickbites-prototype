"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AccountMenu } from "@/components/site/account-menu";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { RequireAdmin, useSession } from "@/features/auth";
import { useT } from "@/i18n";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/**
 * Minimal admin shell. The real sidebar, topbar toggles and new-order alert
 * are built in step 9 — this provides just enough chrome for the 403 to be
 * rendered *inside* the panel rather than as a redirect.
 */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pathname = usePathname();
  const { user, isSuperAdmin } = useSession();

  // Nav entries the signed-in admin is actually allowed to open.
  const navItems = [
    { href: "/admin", label: t.admin.dashboard, visible: true },
    {
      href: "/admin/settings",
      label: t.admin.settings,
      visible: can(user, "SETTINGS"),
    },
    { href: "/admin/staff", label: t.admin.staff, visible: isSuperAdmin },
  ].filter((item) => item.visible);

  return (
    <div className="min-h-dvh bg-cream">
      <header className="border-b border-hairline bg-surface">
        <Container
          width="wide"
          className="flex h-16 items-center justify-between gap-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin" className="text-display text-lg text-brand uppercase">
              Quick Bites
            </Link>
            <Badge variant="muted">{t.admin.panel}</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink sm:inline-flex"
            >
              {t.admin.viewSite}
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
            <LanguageToggle />
            <AccountMenu />
          </div>
        </Container>
      </header>

      <RequireAdmin>
        <>
          <nav
            aria-label={t.admin.panel}
            className="border-b border-hairline bg-surface"
          >
            <Container width="wide" className="flex gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative shrink-0 px-3 py-3 text-sm font-semibold transition-colors",
                      isActive
                        ? "text-brand after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-brand"
                        : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Container>
          </nav>

          <main className="py-8">
            <Container width="wide">{children}</Container>
          </main>
        </>
      </RequireAdmin>
    </div>
  );
}
