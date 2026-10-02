"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteContent } from "@/features/content";
import { usePick, useT } from "@/i18n";
import { formatDate } from "@/lib/format";

/**
 * Shared shell for /privacy and /terms. Both are plain prose from site
 * content, marked as a draft — the client's lawyer will rewrite them, and
 * pretending otherwise on a prototype would be dishonest.
 */
export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const t = useT();
  const pick = usePick();
  const { data: content, isLoading } = useSiteContent();

  const title = kind === "privacy" ? t.legal.privacyTitle : t.legal.termsTitle;

  if (isLoading || !content) {
    return (
      <Container className="py-12">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-6 h-64 w-full" />
      </Container>
    );
  }

  const blocks = content.legal[kind];

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Badge variant="warning">{t.legal.draftBadge}</Badge>
        <h1 className="text-display mt-4 text-3xl text-ink uppercase sm:text-4xl">
          {title}
        </h1>
        <p className="nums mt-2 text-sm text-ink-muted">
          {t.legal.updatedOn(formatDate(`${content.legal.updatedOn}T00:00:00`))}
        </p>
        <p className="mt-4 rounded-card border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink">
          {t.legal.draftNote}
        </p>

        <div className="mt-8 grid gap-7">
          {blocks.map((block) => (
            <section key={block.heading.en}>
              <h2 className="text-display text-xl text-ink uppercase">
                {pick(block.heading)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {pick(block.body)}
              </p>
            </section>
          ))}
        </div>

        <Card className="mt-10 p-5">
          <p className="text-sm font-semibold text-ink">{t.legal.questions}</p>
          <p className="mt-1 text-sm text-ink-muted">{t.legal.questionsBody}</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/contact">{t.nav.contact}</Link>
          </Button>
        </Card>
      </div>
    </Container>
  );
}
