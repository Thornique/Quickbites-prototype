import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageToggle } from "@/components/site/language-toggle";
import { Wordmark } from "@/components/site/wordmark";
import { STORE } from "@/lib/constants";
import { AuthBrandPanel } from "./_brand-panel";

/**
 * Split layout for /login and /signup: the cafe on the left, the form on the
 * right. Below `lg` the photograph is dropped entirely rather than squeezed
 * into a banner — on a phone the form is the whole job, and a decorative strip
 * above it only pushes the first field under the fold.
 *
 * Still no header nav and no cart: nothing here competes with the form.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-cream">
      <AuthBrandPanel />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* The wordmark lives in the panel on wide screens, so it is not repeated. */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-8">
          <Link href="/" aria-label={`${STORE.name} — home`} className="lg:invisible">
            <Wordmark className="h-5 sm:h-6" />
          </Link>
          <LanguageToggle />
        </header>

        <main className="flex flex-1 justify-center px-4 py-4 sm:px-8 sm:py-10 lg:items-center lg:py-6">
          <div className="w-full max-w-[25rem]">
            {/* A surface the form sits on, so it reads as one object on cream. */}
            <div className="rounded-card border border-hairline bg-surface p-6 shadow-card sm:p-8">
              {children}
            </div>
          </div>
        </main>

        <footer className="shrink-0 px-4 pb-8 text-center sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} className="shrink-0" aria-hidden="true" />
            {/* The full address wraps onto two lines on a phone and drags the
                arrow off on its own, so the short form carries the narrow case. */}
            <span className="sm:hidden">{`${STORE.name}, ${STORE.addressLine}`}</span>
            <span className="hidden sm:inline">{`${STORE.name}, ${STORE.addressFull}`}</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}
