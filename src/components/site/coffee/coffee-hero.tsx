"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useOutlet } from "@/features/outlet";
import { useOpenState } from "@/features/settings";
import { usePick, useT } from "@/i18n";
import { formatSlotLabel } from "@/lib/format";

/**
 * The coffee shop's hero.
 *
 * Deliberately not the restaurant's rotating banner carousel: a specialty
 * counter sells one thing well, so this is one still photograph, one headline
 * set in the serif, and two decisions — order, or read the menu. The espresso
 * scrim is what lets cream type sit on a photo at full contrast.
 */
export function CoffeeHero() {
  const t = useT();
  const pick = usePick();
  const { outletId, outlet, details } = useOutlet();
  const { data: openState } = useOpenState(outletId);

  const isOpen = !!openState?.isOpen && !!openState.acceptingOrders;

  return (
    <section className="relative isolate overflow-hidden bg-cocoa">
      {/* The one priority image on the page. */}
      <Image
        src="/images/coffee/hero-pour.webp"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/*
        Two scrims, not one: a vertical wash so the bottom chips stay legible,
        and a left-weighted one so the headline has its own dark ground on
        desktop without dimming the latte art it sits beside.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{ backgroundImage: "var(--gradient-hero-side)" }}
      />

      {/* Steam, drifting off the cup in the photograph. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[18%] bottom-[38%] hidden sm:block"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`coffee-steam coffee-steam-${i + 1} absolute block w-6 rounded-full bg-crema/45`}
            style={{ height: "72px", left: `${i * 26}px` }}
          />
        ))}
      </div>

      <Container className="relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-xl">
          <p className="coffee-eyebrow text-crema/80">{t.coffeeHome.heroEyebrow}</p>

          <h1 className="coffee-display coffee-hero-title mt-3 text-white">
            {t.coffeeHome.heroTitle}
          </h1>

          <p className="measure mt-4 text-base text-crema/85 sm:text-lg">
            {t.coffeeHome.heroBody}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/menu"
              className="coffee-gradient inline-flex h-12 items-center rounded-control px-6 text-sm font-bold text-white shadow-pop transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-espresso motion-reduce:hover:translate-y-0"
            >
              {t.coffeeHome.orderNow}
            </Link>
            <Link
              href="/menu"
              className="inline-flex h-12 items-center rounded-control border border-crema/45 px-6 text-sm font-bold text-crema transition-colors hover:border-crema hover:bg-crema/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-espresso"
            >
              {t.coffeeHome.viewMenu}
            </Link>
          </div>

          {/* Open state and where to collect, as two quiet chips. */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-pill bg-black/35 px-3 py-1.5 text-xs font-semibold text-crema backdrop-blur-sm">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${isOpen ? "bg-veg" : "bg-crema/50"}`}
              />
              {openState
                ? openState.isOpen
                  ? t.store.openNow
                  : t.store.closed
                : t.common.loading}
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <Clock size={13} strokeWidth={2} aria-hidden="true" />
              <span className="nums">
                {openState
                  ? openState.isOpen
                    ? t.store.tillTime(formatSlotLabel(openState.closesAt ?? "22:30"))
                    : t.store.opensAt(formatSlotLabel(openState.opensAt ?? "07:30"))
                  : pick(details.hoursLabel)}
              </span>
            </span>

            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-pill bg-black/35 px-3 py-1.5 text-xs font-semibold text-crema backdrop-blur-sm transition-colors hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white"
            >
              <MapPin size={13} strokeWidth={2} aria-hidden="true" />
              <span className="max-w-56 truncate">{pick(outlet.address)}</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
