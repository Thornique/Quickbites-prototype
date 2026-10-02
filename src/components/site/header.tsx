"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AccountMenu } from "@/components/site/account-menu";
import { CartButton } from "@/components/site/cart-button";
import { LanguageToggle } from "@/components/site/language-toggle";
import { StoreStatusPill } from "@/components/site/store-status-pill";
import { Wordmark } from "@/components/site/wordmark";
import { Container } from "@/components/ui/container";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/menu", key: "menu" },
  { href: "/#offers", key: "offers" },
  { href: "/about", key: "about" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
  { href: "/book-table", key: "bookTable" },
] as const;

export function SiteHeader() {
  const t = useT();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Compact the header once the page has moved, so the menu grid gets more room.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet on navigation.
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const labels: Record<(typeof NAV)[number]["key"], string> = {
    menu: t.nav.menu,
    offers: t.nav.offers,
    about: t.nav.about,
    gallery: t.nav.gallery,
    contact: t.nav.contact,
    bookTable: t.nav.bookTable,
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-control focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t.header.skipToContent}
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 border-b border-hairline bg-surface",
          "transition-shadow duration-150",
          isScrolled && "shadow-card",
        )}
      >
        <Container
          className={cn(
            "flex items-center gap-3 transition-[height] duration-150",
            isScrolled ? "h-14" : "h-16 sm:h-20",
          )}
        >
          <Link href="/" className="shrink-0" aria-label="Quick Bites — home">
            <Wordmark
              className={cn(
                "transition-[height] duration-150",
                isScrolled ? "h-5" : "h-5 sm:h-6",
              )}
            />
          </Link>

          <nav
            aria-label={t.header.primaryNav}
            className="ml-4 hidden flex-1 items-center gap-1 lg:flex"
          >
            {NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-control px-3 py-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "text-brand"
                      : "text-ink hover:bg-sand-50 hover:text-brand",
                  )}
                >
                  {labels[item.key]}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <StoreStatusPill className="hidden xl:inline-flex" />
            <LanguageToggle className="hidden sm:inline-flex" />
            <div className="hidden sm:block">
              <AccountMenu />
            </div>
            <CartButton />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label={t.nav.openMenu}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-control border border-hairline bg-surface text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:hidden"
                >
                  <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[min(20rem,85vw)] p-0">
                <SheetHeader className="border-b border-hairline p-5">
                  <SheetTitle asChild>
                    <span>
                      <Wordmark className="h-5" />
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="p-5">
                  <StoreStatusPill />

                  <nav aria-label={t.header.primaryNav} className="mt-5 grid">
                    {NAV.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        className="rounded-control px-3 py-3 text-base font-semibold text-ink transition-colors hover:bg-sand-50 hover:text-brand"
                      >
                        {labels[item.key]}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-hairline pt-5">
                    <LanguageToggle />
                    <AccountMenu />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </Container>
      </header>
    </>
  );
}
