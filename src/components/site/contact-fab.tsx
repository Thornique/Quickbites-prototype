"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useT } from "@/i18n";
import { STORE } from "@/lib/constants";

/**
 * Floating contact actions.
 *
 * Sits above `--mobile-bar-height`, a variable the sticky mobile cart bar
 * (step 6) will set — reserving the space now means the cart bar can never
 * cover these buttons later.
 */
export function ContactFab() {
  const t = useT();

  return (
    <div
      className="fixed right-4 z-40 flex flex-col gap-2 print:hidden"
      style={{ bottom: "calc(1rem + var(--mobile-bar-height, 0px))" }}
    >
      {/* Calling is the mobile-first action, so it comes first on small screens. */}
      <a
        href={`tel:${STORE.phoneHref}`}
        aria-label={`${t.footer.callUs} ${STORE.phoneDisplay}`}
        className="inline-flex size-12 items-center justify-center rounded-full border border-hairline bg-surface text-ink shadow-pop transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:hidden"
      >
        <Phone size={22} strokeWidth={1.75} aria-hidden="true" />
      </a>

      <a
        href={`https://wa.me/${STORE.whatsappHref}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.footer.whatsapp}
        className="inline-flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-pop transition-transform duration-150 hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 motion-reduce:hover:scale-100"
      >
        <MessageCircle size={22} strokeWidth={2} aria-hidden="true" />
      </a>
    </div>
  );
}
