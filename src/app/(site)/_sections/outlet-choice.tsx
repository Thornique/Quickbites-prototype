"use client";

import Image from "next/image";
import { ArrowRight, Coffee, UtensilsCrossed } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useOutlet } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { OUTLET_DETAILS, OUTLET_LIST } from "@/lib/outlets";
import { cn } from "@/lib/utils";
import type { OutletId } from "@/types";

const CARDS: Record<OutletId, { image: string; icon: typeof Coffee; alt: string }> = {
  restaurant: {
    image: "/images/hero/burger-combo.webp",
    icon: UtensilsCrossed,
    alt: "A burger and fries combo on the counter",
  },
  coffee: {
    image: "/images/menu/cappuccino.webp",
    icon: Coffee,
    alt: "A cappuccino with cocoa dusted over the foam",
  },
};

/**
 * The two-card choice a first-time visitor sees above the home page.
 *
 * It replaces nothing: the hero and the rest of the page are still there
 * underneath, so somebody who ignores this still has a working storefront for
 * the restaurant. Once they have picked — here or from the header switch — it
 * never appears again, because being asked the same question on every visit
 * is how a site tells you it was not paying attention.
 */
export function OutletChoice() {
  const t = useT();
  const pick = usePick();
  const { outletId: active, hasChosen, isHydrated, setOutlet } = useOutlet();

  // Nothing before rehydration: a card that flashes and vanishes is worse
  // than one that arrives a tick late.
  if (!isHydrated || hasChosen) return null;

  const blurbs: Record<OutletId, string> = {
    restaurant: t.outlet.restaurantBlurb,
    coffee: t.outlet.coffeeBlurb,
  };
  const ctas: Record<OutletId, string> = {
    restaurant: t.outlet.restaurantCta,
    coffee: t.outlet.coffeeCta,
  };

  return (
    <section className="border-b border-hairline bg-sand-50 py-8 sm:py-10">
      <Container>
        <h2 className="text-display text-2xl text-ink uppercase sm:text-3xl">
          {t.outlet.chooseTitle}
        </h2>
        <p className="measure mt-2 text-sm text-ink-muted">{t.outlet.chooseBlurb}</p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {OUTLET_LIST.map((outlet) => {
            const card = CARDS[outlet.id];
            const Icon = card.icon;
            const isCoffee = outlet.id === "coffee";

            return (
              <li key={outlet.id}>
                <button
                  type="button"
                  onClick={() => setOutlet(outlet.id)}
                  className={cn(
                    "group flex w-full items-stretch gap-0 overflow-hidden rounded-card border text-left",
                    "bg-surface transition-colors duration-150",
                    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                    outlet.id === active
                      ? "border-brand/50"
                      : "border-hairline hover:border-brand/40",
                  )}
                >
                  <span className="relative hidden w-32 shrink-0 sm:block">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </span>

                  <span className="min-w-0 flex-1 p-4 sm:p-5">
                    <span className="flex items-center gap-2">
                      {/*
                        Painted from the outlet, not the active accent: the
                        point of these cards is to tell the two apart.
                      */}
                      <Icon
                        size={18}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className={
                          isCoffee ? "text-brand-coffee" : "text-brand-restaurant"
                        }
                      />
                      <span className="text-display text-lg text-ink uppercase">
                        {pick(outlet.name)}
                      </span>
                    </span>

                    <span className="mt-1.5 block text-sm text-ink-muted">
                      {blurbs[outlet.id]}
                    </span>
                    <span className="nums mt-1 block text-xs text-ink-muted">
                      {t.outlet.openFrom(pick(OUTLET_DETAILS[outlet.id].hoursLabel))}
                    </span>

                    <span
                      className={cn(
                        "mt-3 inline-flex items-center gap-1.5 text-sm font-bold",
                        isCoffee ? "text-brand-coffee" : "text-brand-restaurant",
                      )}
                    >
                      {ctas[outlet.id]}
                      <ArrowRight
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transform-none"
                      />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
