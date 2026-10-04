"use client";

import { useState } from "react";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useOutlet } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { outletPhoneHref } from "@/lib/outlets";

/**
 * Address, hours and contact, with the map behind a click.
 *
 * The Google Maps iframe pulls roughly a megabyte and sets third-party
 * cookies, so it loads on request rather than on every home-page visit. The
 * address and directions link work without it.
 */
export function LocationBlock() {
  const t = useT();
  const pick = usePick();
  const { outletId, outlet, details } = useOutlet();
  const [showMap, setShowMap] = useState(false);

  const address = pick(outlet.address);
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    address,
  )}&output=embed`;
  const phoneHref = outletPhoneHref(outletId);

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow={t.location.eyebrow}
          title={t.location.title}
          description={t.location.description}
        />

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-card border border-hairline bg-surface p-6">
            <p className="flex items-start gap-3 text-sm text-ink">
              <MapPin
                size={20}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-brand"
                aria-hidden="true"
              />
              <span>{address}</span>
            </p>
            <p className="mt-4 flex items-start gap-3 text-sm text-ink">
              <Clock
                size={20}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-brand"
                aria-hidden="true"
              />
              <span className="nums">{pick(details.hoursLabel)}</span>
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href={`tel:${phoneHref}`}>
                  <Phone aria-hidden="true" />
                  {t.footer.callUs}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`https://wa.me/${phoneHref.replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle aria-hidden="true" />
                  {t.footer.whatsapp}
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href={details.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {t.footer.getDirections}
                </a>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-hairline bg-sand-100 lg:aspect-auto lg:min-h-80">
            {showMap ? (
              <iframe
                src={mapSrc}
                title={t.location.mapLabel}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center transition-colors hover:bg-sand-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand text-white">
                  <MapPin size={22} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-ink">
                  {t.location.loadMap}
                </span>
                <span className="text-xs text-ink-muted">{t.location.mapNote}</span>
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
