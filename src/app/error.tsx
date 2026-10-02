"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useT } from "@/i18n";

/**
 * Branded error boundary for the whole app.
 *
 * No header or footer here: whatever broke may be inside them, and an error
 * page that throws again is worse than a plain one.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    // No error service in a prototype — the console is where this belongs.
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center bg-cream">
      <Container className="py-16">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger">
            <TriangleAlert size={28} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h1 className="text-display mt-5 text-3xl text-ink uppercase sm:text-4xl">
            {t.errorPage.errorTitle}
          </h1>
          <p className="mt-3 text-sm text-ink-muted">{t.errorPage.errorBody}</p>

          {/* Only in development: the message the boundary swallowed. */}
          {process.env.NODE_ENV !== "production" && (
            <pre className="mt-6 overflow-x-auto rounded-card border border-hairline bg-surface p-4 text-left text-xs text-danger">
              {error.message}
            </pre>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>{t.errorPage.tryAgain}</Button>
            <Button asChild variant="outline">
              <Link href="/">{t.errorPage.goHome}</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
