"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useT } from "@/i18n";

/**
 * Branded 404. It keeps the site chrome so a mistyped URL still looks like
 * Quick Bites, and points at the menu rather than at a dead end.
 */
export default function NotFound() {
  const t = useT();

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Container className="py-20 sm:py-28">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-display text-6xl text-brand sm:text-7xl">404</p>
            <h1 className="text-display mt-4 text-3xl text-ink uppercase sm:text-4xl">
              {t.errorPage.notFoundTitle}
            </h1>
            <p className="mt-3 text-sm text-ink-muted">{t.errorPage.notFoundBody}</p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/menu">{t.errorPage.seeMenu}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">{t.errorPage.goHome}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
