"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteContent } from "@/features/content";
import { usePick, useT } from "@/i18n";
import type { EnquirySubject } from "@/types";

/**
 * Off-menu services. Each card's "Enquire" button scrolls to the one form at
 * the bottom and preselects that service, so nobody has to work out which of
 * six dropdown options matches the card they just read.
 */
export function ServicesContent() {
  const t = useT();
  const pick = usePick();
  const { data: content, isLoading } = useSiteContent();
  const [subject, setSubject] = useState<EnquirySubject>("PARTY_ORDER");
  const formRef = useRef<HTMLDivElement>(null);

  const enquireAbout = (next: EnquirySubject) => {
    setSubject(next);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading || !content) {
    return (
      <Container className="py-12">
        <Skeleton className="h-10 w-72" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-card" />
          ))}
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-10 sm:py-14">
        <SectionHeading
          as="h1"
          size="lg"
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          description={t.services.description}
          action={
            <Button asChild variant="outline">
              <Link href="/pricing">{t.services.seePacks}</Link>
            </Button>
          }
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {content.services.map((service) => (
            <Card key={service.id} flush className="flex flex-col">
              <div className="relative aspect-[16/9]">
                <Image
                  src={service.image}
                  alt={pick(service.title)}
                  fill
                  sizes="(min-width: 1024px) 32vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-display text-xl text-ink uppercase">
                  {pick(service.title)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {pick(service.body)}
                </p>

                <p className="mt-4 text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
                  {t.services.includes}
                </p>
                <ul className="mt-2 grid gap-1.5">
                  {service.bullets.map((bullet) => (
                    <li
                      key={bullet.en}
                      className="flex items-start gap-2 text-sm text-ink"
                    >
                      <Check
                        size={16}
                        strokeWidth={2}
                        className="mt-0.5 shrink-0 text-veg-dark"
                        aria-hidden="true"
                      />
                      {pick(bullet)}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
                  <Badge variant="secondary">{pick(service.priceNote)}</Badge>
                  <Button
                    size="sm"
                    onClick={() => enquireAbout(service.subject)}
                    aria-label={t.services.enquireAbout(pick(service.title))}
                  >
                    {t.services.enquire}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>

      <section
        ref={formRef}
        id="enquire"
        className="scroll-mt-24 border-t border-hairline bg-surface py-12 sm:py-16"
      >
        <Container>
          <div className="mx-auto max-w-2xl">
            <EnquiryForm
              defaultSubject={subject}
              title={t.services.formTitle}
              description={t.services.formBody}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
