"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/menu", key: "menu" },
  { href: "/#offers", key: "offers" },
  { href: "/about", key: "about" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
  { href: "/book-table", key: "bookTable" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

function useNavLabels(): Record<NavKey, string> {
  const t = useT();
  return {
    menu: t.nav.menu,
    offers: t.nav.offers,
    about: t.nav.about,
    gallery: t.nav.gallery,
    contact: t.nav.contact,
    bookTable: t.nav.bookTable,
  };
}

/**
 * The primary links. `bar` is the condensed uppercase strip under the utility
 * row on desktop; `sheet` is the stacked list inside the mobile drawer.
 */
export function HeaderNavLinks({ variant }: { variant: "bar" | "sheet" }) {
  const pathname = usePathname();
  const labels = useNavLabels();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        if (variant === "sheet") {
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-control px-3 py-3 text-base font-semibold transition-colors",
                isActive ? "text-brand" : "text-ink hover:bg-sand-50 hover:text-brand",
              )}
            >
              {labels[item.key]}
            </Link>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative inline-flex h-full items-center px-3 text-sm font-bold tracking-wide uppercase transition-colors",
              "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
              isActive
                ? "text-brand after:bg-brand"
                : "text-ink after:bg-transparent hover:text-brand hover:after:bg-brand/30",
            )}
          >
            {labels[item.key]}
          </Link>
        );
      })}
    </>
  );
}
