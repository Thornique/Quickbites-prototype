"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { useSiteContent } from "@/features/content";
import { useOutlet } from "@/features/outlet";
import { useT } from "@/i18n";
import { outletPhoneHref } from "@/lib/outlets";

/**
 * Routes where the bottom-right corner belongs to the ordering controls — the
 * Add buttons and quantity steppers on a menu card, the Track buttons in the
 * account list. A floating button there covers the one control the screen
 * exists for, so contact falls back to the header link and the footer, which
 * every page carries anyway.
 */
const HIDDEN_ON = ["/menu", "/cart", "/checkout", "/order/", "/account"];

/**
 * Floating contact actions, on the pages where nothing competes for the corner.
 *
 * Sits above `--mobile-bar-height`, which the sticky mobile cart bar sets —
 * reserving that space is what stops the cart bar covering these buttons.
 */
export function ContactFab() {
  const t = useT();
  const pathname = usePathname();
  const { outletId, outlet } = useOutlet();
  const { data: content } = useSiteContent();
  const outletCopy = content?.outlets[outletId];

  const phone = outletCopy?.phone ?? outlet.phone;
  const whatsapp = (outletCopy?.whatsapp ?? outlet.phone).replace(/\D/g, "");

  if (HIDDEN_ON.some((route) => pathname.startsWith(route))) return null;

  return (
    <div
      className="fixed right-4 z-40 flex flex-col gap-2 print:hidden"
      style={{ bottom: "calc(1rem + var(--mobile-bar-height, 0px))" }}
    >
      {/* Calling is the mobile-first action, so it comes first on small screens. */}
      <a
        href={`tel:${outletPhoneHref(outletId)}`}
        aria-label={`${t.footer.callUs} ${phone}`}
        className="inline-flex size-12 items-center justify-center rounded-full border border-hairline bg-surface text-ink shadow-pop transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:hidden"
      >
        <Phone size={22} strokeWidth={1.75} aria-hidden="true" />
      </a>

      <a
        href={`https://wa.me/${whatsapp}`}
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
