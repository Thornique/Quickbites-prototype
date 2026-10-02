import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { DemoControls } from "./_demo-controls";
import { DevDataPanel } from "./_panel";

export const metadata: Metadata = {
  title: "Demo data",
  robots: { index: false, follow: false },
};

/**
 * Internal check that the seed loaded, how much localStorage it uses, and a
 * reset button. Development only — step 13 keeps it out of production.
 */
export default function DevDataPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="py-12">
      <Container>
        <p className="text-xs font-bold tracking-[0.12em] text-brand uppercase">
          Internal · development only
        </p>
        <h1 className="text-display mt-3 text-3xl text-ink uppercase sm:text-4xl">
          Demo data
        </h1>
        <p className="measure mt-3 text-sm text-ink-muted">
          Seeded collections, what they cost in browser storage, and a reset. Open this
          page in two tabs to watch cross-tab sync work.
        </p>
        <div className="mt-8">
          <DemoControls />
        </div>
        <div className="mt-6">
          <DevDataPanel />
        </div>
      </Container>
    </main>
  );
}
