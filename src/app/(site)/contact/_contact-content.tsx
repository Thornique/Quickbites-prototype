"use client";

import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useSiteContent } from "@/features/content";
import { usePick, useT } from "@/i18n";
import { OPENING_HOURS, STORE } from "@/lib/constants";
import { telHref } from "@/lib/format";

const MAP_SRC = `https://www.google.com/maps?q=${encodeURIComponent(
  STORE.addressFull,
)}&output=embed`;

export function ContactContent() {
  const t = useT();
  const pick = usePick();
  const [showMap, setShowMap] = useState(false);
  const { data: content } = useSiteContent();

  const contact = content?.contact;

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
        {/* Ways to reach the counter */}
        <div>
          <Card className="p-5">
            <h2 className="text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
              {t.contact.addressTitle}
            </h2>
            <p className="mt-3 flex items-start gap-3 text-sm text-ink">
              <MapPin
                size={20}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-brand"
                aria-hidden="true"
              />
              <span>{contact ? pick(contact.addressLine) : STORE.addressFull}</span>
            </p>

            <h2 className="mt-6 text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
              {t.contact.hoursTitle}
            </h2>
            <p className="mt-3 flex items-start gap-3 text-sm text-ink">
              <Clock
                size={20}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-brand"
                aria-hidden="true"
              />
              <span className="nums">{OPENING_HOURS.label}</span>
            </p>

            <h2 className="mt-6 text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
              {t.contact.reachUs}
            </h2>
            <div className="mt-3 grid gap-2">
              <a
                href={`tel:${telHref(contact?.phone, STORE.phoneHref)}`}
                className="inline-flex items-center gap-2.5 text-sm text-ink transition-colors hover:text-brand"
              >
                <Phone size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className="nums">{contact?.phone ?? STORE.phoneDisplay}</span>
              </a>
              <a
                href={`https://wa.me/${contact?.whatsapp ?? STORE.whatsappHref}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-ink transition-colors hover:text-brand"
              >
                <MessageCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                {t.footer.whatsapp}
              </a>
              <a
                href={`mailto:${contact?.email ?? STORE.email}`}
                className="inline-flex items-center gap-2.5 text-sm text-ink transition-colors hover:text-brand"
              >
                <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
                {contact?.email ?? STORE.email}
              </a>
            </div>

            <Button asChild variant="outline" size="sm" className="mt-6">
              <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer">
                {t.footer.getDirections}
              </a>
            </Button>
          </Card>

          {/*
            The map iframe is a megabyte of third-party code, so it loads on
            request. The address and directions link work without it.
          */}
          <div className="mt-5 overflow-hidden rounded-card border border-hairline bg-sand-100">
            {showMap ? (
              <iframe
                src={MAP_SRC}
                title={t.location.mapLabel}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-72 w-full border-0"
              />
            ) : (
              <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center">
                <MapPin
                  size={28}
                  strokeWidth={1.75}
                  className="text-ink-muted"
                  aria-hidden="true"
                />
                <Button variant="outline" size="sm" onClick={() => setShowMap(true)}>
                  {t.location.loadMap}
                </Button>
                <p className="text-xs text-ink-muted">{t.location.mapNote}</p>
              </div>
            )}
          </div>
        </div>

        <EnquiryForm defaultSubject="OTHER" />
      </div>
    </Container>
  );
}
