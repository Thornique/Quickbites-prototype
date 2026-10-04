"use client";

import Image from "next/image";
import { Coffee, CupSoda, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useT } from "@/i18n";

/**
 * The brew bar: how an order is actually built at this counter.
 *
 * The restaurant's "How it works" explains ordering. This explains the
 * *drink* — pick it, tune it, take it — because the thing a coffee shop has
 * that a burger counter does not is a menu you configure, and the option
 * groups behind step two are real: size, milk, extra shot and sugar.
 */
const STEPS = [
  { icon: Coffee, key: "pick" },
  { icon: SlidersHorizontal, key: "customise" },
  { icon: CupSoda, key: "collect" },
] as const;

export function CoffeeBrewBar() {
  const t = useT();

  const copy: Record<
    (typeof STEPS)[number]["key"],
    { title: string; body: string; note: string }
  > = {
    pick: {
      title: t.coffeeHome.stepPickTitle,
      body: t.coffeeHome.stepPickBody,
      note: t.coffeeHome.stepPickNote,
    },
    customise: {
      title: t.coffeeHome.stepCustomiseTitle,
      body: t.coffeeHome.stepCustomiseBody,
      note: t.coffeeHome.stepCustomiseNote,
    },
    collect: {
      title: t.coffeeHome.stepCollectTitle,
      body: t.coffeeHome.stepCollectBody,
      note: t.coffeeHome.stepCollectNote,
    },
  };

  return (
    <section className="relative isolate overflow-hidden bg-cocoa">
      {/* Beans, far back and heavily dimmed — texture, not a picture. */}
      <Image
        src="/images/coffee/beans-band.webp"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-20"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-cocoa/75" />
      <div aria-hidden="true" className="coffee-bean-pattern absolute inset-0" />

      <Container className="relative py-14 sm:py-18">
        <p className="coffee-eyebrow text-crema/70">{t.coffeeHome.brewEyebrow}</p>
        <h2 className="coffee-display mt-1.5 max-w-xl text-3xl text-white sm:text-4xl">
          {t.coffeeHome.brewTitle}
        </h2>

        <ol className="mt-9 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const { title, body, note } = copy[step.key];

            return (
              <li
                key={step.key}
                className="rounded-card border border-crema/15 bg-crema/[0.06] p-5 backdrop-blur-[2px]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                    <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="nums coffee-display text-2xl text-crema/35"
                  >
                    0{index + 1}
                  </span>
                </div>

                <h3 className="coffee-display mt-4 text-xl text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-crema/80">{body}</p>
                <p className="mt-3 border-t border-crema/15 pt-3 text-xs font-semibold text-brand">
                  {note}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
