"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useBanners } from "@/features/content";
import { usePick, useT } from "@/i18n";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 6000;

export function HeroCarousel() {
  const t = useT();
  const pick = usePick();
  const { data: banners, isLoading } = useBanners(true);

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = banners?.length ?? 0;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  // Auto-advance, unless paused by hover/focus or by the reduced-motion setting.
  useEffect(() => {
    if (count <= 1 || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [count, isPaused, prefersReducedMotion]);

  if (isLoading) {
    return (
      <Skeleton className="aspect-[4/5] w-full rounded-none sm:aspect-[16/9] lg:aspect-[32/9]" />
    );
  }
  if (!banners || banners.length === 0) return null;

  const active = banners[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t.hero.carouselLabel}
      className="relative isolate"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[32/9]">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-out motion-reduce:transition-none",
              i === index ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <Image
              src={banner.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/*
              A flat ink scrim, not a gradient: it keeps the headline legible
              over any photo without the soft-focus look the brief rules out.
            */}
            <div className="absolute inset-0 bg-ink/45 sm:bg-ink/35" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-end pb-16 sm:items-center sm:pb-0">
          <Container>
            <div className="max-w-xl">
              <h1 className="text-display text-[clamp(2rem,5.5vw,3.5rem)] text-white uppercase">
                {pick(active.headline)}
              </h1>
              <p className="mt-2.5 max-w-md text-base text-white/85 sm:text-lg lg:mt-3">
                {pick(active.subhead)}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 lg:mt-6">
                <Button asChild size="lg">
                  <Link href={active.ctaHref}>{t.hero.orderTakeaway}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href="/menu">{t.hero.seeMenu}</Link>
                </Button>
              </div>
            </div>
          </Container>
        </div>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={t.hero.previous}
              className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-ink/40 text-white transition-colors hover:bg-ink/70 focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={t.hero.next}
              className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-ink/40 text-white transition-colors hover:bg-ink/70 focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
              {/*
                The bar stays 6px tall, but the button around it is a 24px
                touch target — the size a thumb (and WCAG) expects.
              */}
              <div className="flex items-center">
                {banners.map((banner, i) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={t.hero.goToSlide(i + 1)}
                    aria-current={i === index ? "true" : undefined}
                    className="group/dot flex h-6 items-center rounded-pill px-1.5 focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1.5 rounded-pill transition-all duration-200",
                        i === index
                          ? "w-7 bg-white"
                          : "w-3 bg-white/45 group-hover/dot:bg-white/70",
                      )}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                aria-label={isPaused ? t.hero.play : t.hero.pause}
                className="ml-1.5 inline-flex size-7 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-ink/60 focus-visible:ring-2 focus-visible:ring-white"
              >
                {isPaused ? (
                  <Play size={12} fill="currentColor" aria-hidden="true" />
                ) : (
                  <Pause size={12} fill="currentColor" aria-hidden="true" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Announce slide changes without moving focus. */}
      <p aria-live="polite" className="sr-only">
        {pick(active.headline)}
      </p>
    </section>
  );
}
