"use client";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useT } from "@/i18n";

/**
 * Numbered timeline, deliberately not three icon cards.
 *
 * The connecting rule and the oversized numerals carry the sequence, which is
 * the actual information — that these happen in order, roughly 12 minutes
 * apart. Three identical icon tiles would say nothing about sequence.
 */
export function HowItWorks() {
  const t = useT();

  return (
    <section className="bg-surface py-12 sm:py-16">
      <Container>
        <SectionHeading
          eyebrow={t.howItWorks.eyebrow}
          title={t.howItWorks.title}
          description={t.howItWorks.note}
        />

        <ol className="relative mt-9 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {/* The rule that makes it a timeline rather than a grid. */}
          <span
            aria-hidden="true"
            className="absolute top-6 right-0 left-0 hidden border-t-2 border-dashed border-hairline sm:block"
          />

          {t.howItWorks.steps.map((step, index) => (
            <li key={step.title} className="relative">
              <span
                aria-hidden="true"
                className="text-display relative z-10 inline-flex size-12 items-center justify-center rounded-full bg-brand text-xl text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                <span className="sr-only">{`${index + 1}. `}</span>
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
