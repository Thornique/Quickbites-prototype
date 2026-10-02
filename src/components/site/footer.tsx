"use client";

import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/site/social-icons";
import { Wordmark } from "@/components/site/wordmark";
import { Container } from "@/components/ui/container";
import { useT } from "@/i18n";
import { OPENING_HOURS, STORE } from "@/lib/constants";

const QUICK_LINKS = [
  { href: "/menu", key: "menu" },
  { href: "/about", key: "about" },
  { href: "/gallery", key: "gallery" },
  { href: "/reviews", key: "reviews" },
  { href: "/services", key: "services" },
  { href: "/book-table", key: "bookTable" },
] as const;

/**
 * Ink footer. The dark block closes the warm cream page and keeps the brand
 * red readable on it, which it would not be on another cream band.
 */
export function SiteFooter() {
  const t = useT();

  const linkLabels: Record<(typeof QUICK_LINKS)[number]["key"], string> = {
    menu: t.nav.menu,
    about: t.nav.about,
    gallery: t.nav.gallery,
    reviews: t.reviews.readAll,
    services: "Party & bulk orders",
    bookTable: t.nav.bookTable,
  };

  return (
    <footer className="mt-20 bg-ink text-white/75">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + address */}
          <div className="lg:col-span-2">
            <Wordmark variant="stacked" tone="light" className="h-14" />
            <h2 className="mt-5 text-xs font-bold tracking-[0.12em] text-white/65 uppercase">
              {t.footer.visitUs}
            </h2>
            <a
              href={STORE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex max-w-xs items-start gap-2 text-sm text-white/80 transition-colors hover:text-white"
            >
              <MapPin
                size={18}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>
                {STORE.addressFull}
                <span className="mt-0.5 block text-xs text-mustard">
                  {t.footer.getDirections} →
                </span>
              </span>
            </a>

            <p className="mt-5 text-xs text-white/65">{t.footer.fssai(STORE.fssai)}</p>
          </div>

          {/* Hours + contact */}
          <div>
            <h2 className="text-xs font-bold tracking-[0.12em] text-white/65 uppercase">
              {t.footer.openingHours}
            </h2>
            <p className="mt-2 flex items-start gap-2 text-sm">
              <Clock
                size={18}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span className="nums">
                {t.footer.everyDay}
                <br />
                {OPENING_HOURS.label}
              </span>
            </p>

            <div className="mt-5 grid gap-2">
              <a
                href={`tel:${STORE.phoneHref}`}
                className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
              >
                <Phone size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className="nums">{STORE.phoneDisplay}</span>
              </a>
              <a
                href={`https://wa.me/${STORE.whatsappHref}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
              >
                <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                {t.footer.whatsapp}
              </a>
            </div>
          </div>

          {/* Quick links + social */}
          <div>
            <h2 className="text-xs font-bold tracking-[0.12em] text-white/65 uppercase">
              {t.footer.quickLinks}
            </h2>
            <ul className="mt-2 grid gap-1.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {linkLabels[link.key]}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="mt-6 text-xs font-bold tracking-[0.12em] text-white/65 uppercase">
              {t.footer.followUs}
            </h2>
            <div className="mt-2 flex gap-2">
              <a
                href={STORE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex size-10 items-center justify-center rounded-control border border-white/15 transition-colors hover:border-white/40 hover:text-white"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={STORE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="inline-flex size-10 items-center justify-center rounded-control border border-white/15 transition-colors hover:border-white/40 hover:text-white"
              >
                <FacebookIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/65">{t.footer.rights}</p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-white/60 transition-colors hover:text-white"
            >
              {t.footer.privacy}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/60 transition-colors hover:text-white"
            >
              {t.footer.terms}
            </Link>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/60">{t.footer.prototypeNote}</p>
      </Container>
    </footer>
  );
}
