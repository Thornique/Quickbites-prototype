"use client";

import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/site/social-icons";
import { Wordmark } from "@/components/site/wordmark";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { useSiteContent } from "@/features/content";
import { useOutlet } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { STORE } from "@/lib/constants";
import { outletPhoneHref } from "@/lib/outlets";

const QUICK_LINKS = [
  { href: "/menu", key: "menu" },
  { href: "/about", key: "about" },
  { href: "/gallery", key: "gallery" },
  { href: "/reviews", key: "reviews" },
  { href: "/services", key: "services" },
  { href: "/pricing", key: "pricing" },
  { href: "/book-table", key: "bookTable" },
] as const;

const COLUMN_HEADING = "text-xs font-bold tracking-[0.12em] text-white/50 uppercase";
const COLUMN_LINK = "text-sm text-white/80 transition-colors hover:text-white";

/**
 * Ink footer, laid out as tight uppercase-header columns (brand, visit,
 * explore, legal) with a slim closing bar — logo mark, copyright and social
 * icons in one row — rather than everything stacked into one wide block.
 */
export function SiteFooter() {
  const t = useT();
  const pick = usePick();
  const { outletId, outlet, details } = useOutlet();
  const { data: content } = useSiteContent();
  const outletCopy = content?.outlets[outletId];

  const address = outletCopy ? pick(outletCopy.addressLine) : pick(outlet.address);
  const phone = outletCopy?.phone ?? outlet.phone;
  const whatsapp = (outletCopy?.whatsapp ?? outlet.phone).replace(/\D/g, "");

  const linkLabels: Record<(typeof QUICK_LINKS)[number]["key"], string> = {
    menu: t.nav.menu,
    about: t.nav.about,
    gallery: t.nav.gallery,
    reviews: t.nav.reviews,
    services: t.nav.services,
    pricing: t.nav.pricing,
    bookTable: t.nav.bookTable,
  };

  return (
    <footer className="mt-20 bg-ink text-white/75">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Wordmark
              variant="stacked"
              tone="light"
              className="h-12"
              outletId={outletId}
            />
            <p className="mt-4 text-xs text-white/65">{t.footer.fssai(STORE.fssai)}</p>
          </div>

          {/* Visit us: address + hours */}
          <div>
            <h2 className={COLUMN_HEADING}>{t.footer.visitUs}</h2>
            <a
              href={details.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-start gap-2 text-sm text-white/80 transition-colors hover:text-white"
            >
              <MapPin
                size={16}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>
                {address}
                <span className="mt-0.5 block text-xs text-mustard">
                  {t.footer.getDirections} →
                </span>
              </span>
            </a>

            <p className="mt-4 flex items-start gap-2 text-sm">
              <Clock
                size={16}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span className="nums">
                {t.footer.everyDay}
                <br />
                {outletCopy ? pick(outletCopy.hoursNote) : pick(details.hoursLabel)}
              </span>
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className={COLUMN_HEADING}>{t.footer.callUs}</h2>
            <div className="mt-3 grid gap-2.5">
              <a
                href={`tel:${outletPhoneHref(outletId)}`}
                className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
              >
                <Phone size={16} strokeWidth={1.75} aria-hidden="true" />
                <span className="nums">{phone}</span>
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
              >
                <MessageCircle size={16} strokeWidth={1.75} aria-hidden="true" />
                {t.footer.whatsapp}
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h2 className={COLUMN_HEADING}>{t.footer.quickLinks}</h2>
            <ul className="mt-3 grid gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className={COLUMN_LINK}>
                    {linkLabels[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className={COLUMN_HEADING}>{t.footer.legal}</h2>
            <ul className="mt-3 grid gap-2">
              <li>
                <Link href="/contact" className={COLUMN_LINK}>
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={COLUMN_LINK}>
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className={COLUMN_LINK}>
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Closing bar: mark, copyright, social — one row, like a real brand footer */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Wordmark className="h-4" tone="light" outletId={outletId} />
            <span aria-hidden="true" className="text-white/20">
              ·
            </span>
            <p className="text-xs text-white/60">{t.footer.rights}</p>
            <span aria-hidden="true" className="hidden text-white/20 sm:inline">
              ·
            </span>
            {/* Mustard carries ink text, so it stays legible on the dark band. */}
            <Badge variant="mustard">{t.common.prototype}</Badge>
            <p className="text-xs text-white/60">{t.footer.prototypeNote}</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={STORE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-white/40 hover:text-white"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href={STORE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-white/40 hover:text-white"
            >
              <FacebookIcon size={16} />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
