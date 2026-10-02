"use client";

import Link from "next/link";
import { Check, UtensilsCrossed } from "lucide-react";
import { MenuCard } from "@/components/site/menu-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { SectionHeading } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteContent } from "@/features/content";
import { useMenu } from "@/features/menu";
import { usePick, useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Combos come from the real menu — a price list that can disagree with the
 * menu is worse than no price list. Party packs are fixed quotes and live in
 * site content, where the admin can reprice them.
 */
export function PricingContent() {
  const t = useT();
  const pick = usePick();
  const { data: content, isLoading } = useSiteContent();
  const { data: combos, isLoading: isMenuLoading } = useMenu({
    categoryId: "cat-combos",
  });

  if (isLoading || !content) {
    return (
      <Container className="py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-8 h-64 w-full rounded-card" />
      </Container>
    );
  }

  const { pricing } = content;

  return (
    <Container className="py-10 sm:py-14">
      <SectionHeading
        as="h1"
        size="lg"
        eyebrow={t.pricing.eyebrow}
        title={t.pricing.title}
        description={pick(pricing.intro)}
      />

      {/* Combo meals, straight off the menu. */}
      <section className="mt-10">
        <SectionHeading
          title={t.pricing.combosTitle}
          description={t.pricing.combosBody}
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/menu#combos-meals">{t.errorPage.seeMenu}</Link>
            </Button>
          }
        />

        {isMenuLoading && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-card" />
            ))}
          </div>
        )}

        {!isMenuLoading && (combos ?? []).length === 0 && (
          <EmptyState
            className="mt-5"
            icon={UtensilsCrossed}
            title={t.pricing.noCombos}
            description={t.pricing.noCombosBody}
          />
        )}

        {(combos ?? []).length > 0 && (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(combos ?? []).map((item) => (
              <li key={item.id} className="relative">
                <MenuCard item={item} layout="card" />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Party packs — fixed quotes, enquiry only. */}
      <section className="mt-14">
        <SectionHeading title={t.pricing.packsTitle} />

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {pricing.partyPacks.map((pack) => (
            <Card
              key={pack.id}
              className={cn(
                "flex flex-col p-5",
                pack.isPopular && "border-brand/40 bg-brand/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-display text-xl text-ink uppercase">
                    {pick(pack.name)}
                  </h3>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {t.pricing.feeds(pack.people)}
                  </p>
                </div>
                {pack.isPopular && <Badge>{t.pricing.popular}</Badge>}
              </div>

              <p className="mt-4">
                <Price value={pack.price} size="xl" />
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {t.pricing.perPerson(formatPrice(Math.round(pack.price / pack.people)))}
              </p>

              <ul className="mt-5 grid flex-1 gap-2">
                {pack.inclusions.map((line) => (
                  <li key={line.en} className="flex items-start gap-2 text-sm text-ink">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-veg-dark"
                      aria-hidden="true"
                    />
                    {pick(line)}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={pack.isPopular ? "default" : "outline"}
                className="mt-6"
              >
                <Link
                  href="/services#enquire"
                  aria-label={t.pricing.enquirePack(pick(pack.name))}
                >
                  {t.services.enquire}
                </Link>
              </Button>
            </Card>
          ))}
        </div>

        <p className="measure mt-6 text-sm text-ink-muted">{pick(pricing.note)}</p>
      </section>
    </Container>
  );
}
