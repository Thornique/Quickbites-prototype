"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, Flame, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteContent } from "@/features/content";
import { usePick, useT } from "@/i18n";
import { OPENING_HOURS, STORE } from "@/lib/constants";

/**
 * The brand story. Every word comes from siteContent so the admin content
 * module can reword it later without a deploy — only the layout lives here.
 */
export function AboutContent() {
  const t = useT();
  const pick = usePick();
  const { data: content, isLoading } = useSiteContent();

  if (isLoading || !content) {
    return (
      <Container className="py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-64 w-full rounded-card" />
        <Skeleton className="mt-6 h-32 w-full rounded-card" />
      </Container>
    );
  }

  const { about } = content;

  const stats = [
    { icon: UtensilsCrossed, label: t.about.statKitchen },
    { icon: Clock, label: t.about.statMinutes },
    { icon: Flame, label: t.about.statSince },
  ];

  return (
    <>
      {/* Story, with the counter photo beside it. */}
      <Container className="py-12 sm:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-xs font-bold tracking-[0.12em] text-brand uppercase">
              {t.about.eyebrow}
            </p>
            <h1 className="text-display mt-3 text-3xl text-ink uppercase sm:text-4xl lg:text-5xl">
              {pick(about.story.heading)}
            </h1>
            <p className="measure mt-4 text-base text-ink-muted">{t.about.intro}</p>
            <p className="measure mt-4 text-sm leading-relaxed text-ink">
              {pick(about.story.body)}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/menu">{t.hero.orderTakeaway}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/gallery">{t.nav.gallery}</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-hairline">
            <Image
              src="/images/gallery/cafe-counter.jpg"
              alt={pick(about.story.heading)}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Three plain facts, not three icon cards pretending to be a hero. */}
        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className="flex items-center gap-3 rounded-card border border-hairline bg-surface px-4 py-3"
            >
              <stat.icon size={20} strokeWidth={1.75} className="shrink-0 text-brand" />
              <span className="text-sm font-semibold text-ink">{stat.label}</span>
            </li>
          ))}
        </ul>
      </Container>

      {/* Values */}
      <section className="border-y border-hairline bg-surface py-12 sm:py-16">
        <Container>
          <SectionHeading title={t.about.valuesTitle} />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {about.values.map((value) => (
              <Card key={value.heading.en} className="p-5">
                <h3 className="text-display text-lg text-ink uppercase">
                  {pick(value.heading)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {pick(value.body)}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Kitchen & hygiene */}
      <Container className="py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-hairline lg:order-last">
            <Image
              src="/images/gallery/cafe-interior.jpg"
              alt={pick(about.hygiene.heading)}
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <SectionHeading
              eyebrow={t.about.hygieneTitle}
              title={pick(about.hygiene.heading)}
            />
            <p className="measure mt-4 text-sm leading-relaxed text-ink-muted">
              {pick(about.hygiene.body)}
            </p>

            <ul className="mt-6 grid gap-2.5">
              {t.about.hygienePoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-ink">
                  <CheckCircle2
                    size={18}
                    strokeWidth={1.75}
                    className="mt-0.5 shrink-0 text-veg-dark"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>

            {/* FSSAI licence — the number is a placeholder until the client sends it. */}
            <Card className="mt-6 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {t.about.licenceTitle}
                  </p>
                  <p className="nums mt-0.5 text-sm text-ink-muted">
                    {t.footer.fssai(about.fssaiNumber)}
                  </p>
                </div>
                <Badge variant="warning">{t.legal.draftBadge}</Badge>
              </div>
              <p className="mt-2 text-xs text-ink-muted">{t.about.licenceNote}</p>
            </Card>
          </div>
        </div>
      </Container>

      {/* Visit */}
      <section className="bg-sand-100 py-12">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-display text-2xl text-ink uppercase sm:text-3xl">
                {t.about.visitTitle}
              </h2>
              <p className="measure mt-2 text-sm text-ink-muted">{t.about.visitBody}</p>
              <p className="mt-3 text-sm text-ink">
                {pick(content.contact.addressLine)} · {OPENING_HOURS.label}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {t.footer.getDirections}
                </a>
              </Button>
              <Button asChild>
                <Link href="/book-table">{t.nav.bookTable}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
