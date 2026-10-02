"use client";

import Link from "next/link";
import { AccountMenu } from "@/components/site/account-menu";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Container } from "@/components/ui/container";
import { RequireCustomer } from "@/features/auth";

/**
 * Everything under /account needs a signed-in customer. The real site header
 * arrives in step 4 — this is the minimum needed to exercise the guard.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-cream">
      <header className="border-b border-hairline bg-surface">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-display text-xl text-brand uppercase transition-colors hover:text-brand-hover"
          >
            Quick Bites
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <AccountMenu />
          </div>
        </Container>
      </header>

      <RequireCustomer>
        <main className="py-10">
          <Container>{children}</Container>
        </main>
      </RequireCustomer>
    </div>
  );
}
