"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { AccountMenu } from "@/components/site/account-menu";
import { CartButton } from "@/components/site/cart-button";
import { HeaderNavLinks } from "@/components/site/header-nav";
import { LanguageToggle } from "@/components/site/language-toggle";
import { OrderModeSwitch } from "@/components/site/order-mode-switch";
import { OutletPill } from "@/components/site/outlet-pill";
import { StoreStatusPill } from "@/components/site/store-status-pill";
import { useSession } from "@/features/auth";
import { NotificationBell } from "@/features/notifications";
import { OutletSwitch, useOutlet } from "@/features/outlet";
import { Wordmark } from "@/components/site/wordmark";
import { Container } from "@/components/ui/container";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePick, useT } from "@/i18n";
import { cn } from "@/lib/utils";

/** Jumps to — and focuses — the search field on the menu page. */
const SEARCH_HREF = "/menu#menu-search";

export function SiteHeader() {
  const t = useT();
  const pick = usePick();
  const { outletId, outlet } = useOutlet();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { isSignedIn } = useSession();

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
        {/* Utility row: identity, how you are eating, where you collect. */}
        <Container
          className={cn(
            "flex items-center gap-3 transition-[height] duration-150 sm:gap-4",
            isScrolled ? "h-14" : "h-16 sm:h-18",
          )}
        >
          <Link
            href="/"
            className="shrink-0"
            aria-label={`${pick(outlet.name)} — home`}
          >
            <Wordmark
              outletId={outletId}
              className={cn(
                "transition-[height] duration-150",
                /* The coffee lockup is a third wider, so it sits a touch lower. */
                isScrolled ? "h-5" : "h-5 sm:h-6",
                outletId === "coffee" && "max-w-44 sm:max-w-none",
              )}
            />
          </Link>

          {/*
            The outlet switch comes before the order mode: which shop you are
            buying from decides what the rest of the row even means.
          */}
          <div className="hidden min-w-0 items-center gap-3 lg:flex xl:gap-4">
            <OutletSwitch />
            <span aria-hidden="true" className="h-6 w-px bg-hairline" />
            <OrderModeSwitch />
            <span aria-hidden="true" className="hidden h-6 w-px bg-hairline 2xl:block" />
            {/* Last in and first out: at 1280 the coffee wordmark plus the
                switch already fill the row. */}
            <OutletPill className="hidden max-w-56 2xl:inline-flex" />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LanguageToggle className="hidden sm:inline-flex" />
            {isSignedIn && <NotificationBell className="hidden sm:inline-flex" />}
            <div className="hidden sm:block">
              <AccountMenu showLabel />
            </div>
            <CartButton className="lg:hidden" />
            <CartButton className="hidden lg:inline-flex" showLabel />

            <Link
              href={SEARCH_HREF}
              aria-label={t.header.searchMenu}
              className="hidden size-10 shrink-0 items-center justify-center rounded-control text-ink transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:inline-flex"
            >
              <Search size={20} strokeWidth={1.75} aria-hidden="true" />
            </Link>

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
                      <Wordmark className="h-5" outletId={outletId} />
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="p-5">
                  <OutletSwitch size="lg" />
                  <StoreStatusPill className="mt-4" />

                  <nav aria-label={t.header.primaryNav} className="mt-5 grid">
                    <HeaderNavLinks variant="sheet" />
                  </nav>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-hairline pt-5">
                    <LanguageToggle />
                    <div className="flex items-center gap-2">
                      {isSignedIn && <NotificationBell />}
                      <AccountMenu />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </Container>

        {/* Second row: the links on desktop, the order mode on mobile. */}
        <div className="border-t border-hairline bg-sand-50 lg:bg-surface">
          <Container className="flex h-11 items-center gap-3">
            <nav
              aria-label={t.header.primaryNav}
              className="hidden h-full flex-1 items-center gap-1 lg:flex"
            >
              <HeaderNavLinks variant="bar" />
            </nav>

            <StoreStatusPill className="hidden lg:inline-flex" />

            <div className="flex w-full items-center justify-between gap-3 lg:hidden">
              <OrderModeSwitch />
              <OutletPill className="min-w-0 border-0 bg-transparent px-0 py-0 text-xs" />
            </div>
          </Container>
        </div>
      </header>
    </>
  );
}
