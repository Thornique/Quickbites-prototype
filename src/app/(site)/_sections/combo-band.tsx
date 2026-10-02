"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useT } from "@/i18n";

/**
 * Mustard deal band. The one place the accent colour runs full width — it
 * breaks the cream/white rhythm so the combos read as a distinct offer.
 */
export function ComboBand() {
  const t = useT();

  return (
    <section className="bg-mustard">
      <Container className="grid items-center gap-8 py-12 sm:py-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-xs font-bold tracking-[0.12em] text-ink/60 uppercase">
            {t.combos.eyebrow}
          </p>
          <h2 className="text-display mt-2 text-[clamp(1.75rem,5vw,3rem)] text-ink uppercase">
            {t.combos.title}
          </h2>
          <p className="measure mt-3 text-base text-ink/75">{t.combos.description}</p>
          <Button asChild size="lg" className="mt-6 bg-ink hover:bg-ink/85">
            <Link href="/menu#combos-meals">{t.combos.cta}</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card">
            <Image
              src="/images/hero/burger-combo.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 45vw, 260px"
              className="object-cover"
            />
          </div>
          <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-card">
            <Image
              src="/images/menu/classic-fries.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 45vw, 260px"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
