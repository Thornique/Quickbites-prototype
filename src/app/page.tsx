import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { STORE } from "@/lib/constants";

/**
 * Interim landing page. The real home page — hero carousel, category rail,
 * bestsellers, offers and location block — is built in step 4.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-dvh items-center">
      <Container>
        <p className="text-xs font-bold tracking-[0.12em] text-brand uppercase">
          Prototype · Step 1 of 15
        </p>
        <h1 className="text-display mt-3 text-4xl text-ink uppercase sm:text-6xl">
          {STORE.name}
        </h1>
        <p className="measure mt-4 text-base text-ink-muted">
          Design system and project foundation are in place. The storefront, menu and
          admin panel are built in the steps that follow — start with the style guide to
          review tokens and primitives.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/styleguide">
              Open the style guide
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}
