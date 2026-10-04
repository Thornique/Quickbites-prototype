"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSiteContent } from "@/features/content";
import { OutletBadge, useOutlet } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { STORE } from "@/lib/constants";
import { OUTLET_DETAILS, OUTLET_LIST, outletPhoneHref } from "@/lib/outlets";
import { cn } from "@/lib/utils";
import type { OutletId } from "@/types";

/**
 * Contact.
 *
 * Both outlets are listed, always: somebody looking up an address has not
 * necessarily set the switch in the header to the shop they mean, and making
 * them find the toggle first would be a silly way to hide a phone number.
 * The map loads for whichever card they ask for.
 */
export function ContactContent() {
  const t = useT();
  const pick = usePick();
  const { outletId: activeOutletId } = useOutlet();
  const { data: content } = useSiteContent();
  const [mapFor, setMapFor] = useState<OutletId | null>(null);

  const email = content?.contact.email ?? STORE.email;

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow={t.contact.eyebrow}
        title={t.contact.title}
        description={t.contact.description}
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div>
          <h2 className="text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
            {t.outlet.bothOutlets}
          </h2>

          <div className="mt-3 grid gap-5">
            {OUTLET_LIST.map((outlet) => {
              const copy = content?.outlets[outlet.id];
              const details = OUTLET_DETAILS[outlet.id];
              const address = copy ? pick(copy.addressLine) : pick(outlet.address);
              const hours = copy ? pick(copy.hoursNote) : pick(details.hoursLabel);
              const phone = copy?.phone ?? outlet.phone;
              const whatsapp = (copy?.whatsapp ?? outlet.phone).replace(/\D/g, "");
              const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
                address,
              )}&output=embed`;

              return (
                <Card
                  key={outlet.id}
                  className={cn(
                    "p-5",
                    // A quiet marker on the one they are currently shopping.
                    outlet.id === activeOutletId && "border-brand/40",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-display text-lg text-ink uppercase">
                      {pick(outlet.name)}
                    </h3>
                    <OutletBadge outletId={outlet.id} />
                  </div>

                  <p className="mt-3 flex items-start gap-3 text-sm text-ink">
                    <MapPin
                      size={20}
                      strokeWidth={1.75}
                      className="mt-0.5 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="sr-only">{t.contact.addressTitle}: </span>
                      {address}
                    </span>
                  </p>

                  <p className="mt-3 flex items-start gap-3 text-sm text-ink">
                    <Clock
                      size={20}
                      strokeWidth={1.75}
                      className="mt-0.5 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    <span className="nums">
                      <span className="sr-only">{t.contact.hoursTitle}: </span>
                      {hours}
                    </span>
                  </p>

                  <div className="mt-4 grid gap-2">
                    <a
                      href={`tel:${outletPhoneHref(outlet.id)}`}
                      className="inline-flex items-center gap-2.5 text-sm text-ink transition-colors hover:text-brand"
                    >
                      <Phone size={18} strokeWidth={1.75} aria-hidden="true" />
                      <span className="nums">{phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 text-sm text-ink transition-colors hover:text-brand"
                    >
                      <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                      {t.footer.whatsapp}
                    </a>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={details.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.footer.getDirections}
                      </a>
                    </Button>
                    {mapFor !== outlet.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMapFor(outlet.id)}
                      >
                        {t.location.loadMap}
                      </Button>
                    )}
                  </div>

                  {/*
                    The map iframe is a megabyte of third-party code, so it
                    loads on request — and only for the outlet asked for.
                  */}
                  {mapFor === outlet.id && (
                    <div className="mt-4 overflow-hidden rounded-card border border-hairline">
                      <iframe
                        src={mapSrc}
                        title={`${pick(outlet.name)} — ${t.location.mapLabel}`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="block h-64 w-full border-0"
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <h2 className="mt-7 text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
            {t.contact.reachUs}
          </h2>
          <a
            href={`mailto:${email}`}
            className="mt-3 inline-flex items-center gap-2.5 text-sm text-ink transition-colors hover:text-brand"
          >
            <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
            {email}
          </a>
          <p className="mt-1 text-xs text-ink-muted">{t.location.mapNote}</p>
        </div>

        <EnquiryForm defaultSubject="OTHER" />
      </div>
    </Container>
  );
}
