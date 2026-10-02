import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Container } from "@/components/ui/container";

/**
 * Centred card layout for /login and /signup. Deliberately quiet — no header
 * nav or cart, so nothing competes with the form.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="border-b border-hairline bg-surface">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-display text-xl text-brand uppercase transition-colors hover:text-brand-hover"
          >
            Quick Bites
          </Link>
          <LanguageToggle />
        </Container>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:items-center sm:py-16">
        <div className="w-full max-w-[26rem]">{children}</div>
      </main>

      <footer className="pb-8">
        <Container className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Quick Bites, Bombay Bazar, Khandwa
          </Link>
        </Container>
      </footer>
    </div>
  );
}
