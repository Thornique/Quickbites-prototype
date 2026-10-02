import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ControlsSection } from "./_sections/controls";
import { FoodSection } from "./_sections/food";
import { OverlaysSection } from "./_sections/overlays";
import { TokensSection } from "./_sections/tokens";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "#colour", label: "Colour" },
  { href: "#type", label: "Typography" },
  { href: "#shape", label: "Shape" },
  { href: "#buttons", label: "Buttons" },
  { href: "#fields", label: "Fields" },
  { href: "#choices", label: "Choices" },
  { href: "#food", label: "Food" },
  { href: "#badges", label: "Badges" },
  { href: "#tabs", label: "Tabs" },
  { href: "#overlays", label: "Overlays" },
  { href: "#table", label: "Table" },
];

/**
 * Internal design-system review page. Not part of the customer site — it is
 * excluded from production builds in step 13.
 */
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="pb-24">
      <Container>
        <header className="py-12">
          <p className="text-xs font-bold tracking-[0.12em] text-brand uppercase">
            Internal · not a customer page
          </p>
          <h1 className="text-display mt-3 text-4xl text-ink uppercase sm:text-5xl">
            Quick Bites design system
          </h1>
          <p className="measure mt-3 text-base text-ink-muted">
            Every token and primitive the storefront and admin panel are built from.
            Check this at 360px, 768px and 1440px before moving on.
          </p>
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Style guide sections">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-pill border border-hairline bg-surface px-3 py-1 text-xs font-semibold text-ink-muted transition-colors hover:border-brand hover:text-brand"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <div className="space-y-12">
          <TokensSection />
          <ControlsSection />
          <FoodSection />
          <OverlaysSection />
        </div>
      </Container>
    </main>
  );
}
