"use client";

import Image from "next/image";
import { Clock, QrCode, Wallet } from "lucide-react";
import { Wordmark } from "@/components/site/wordmark";
import { useT } from "@/i18n";
import { STORE } from "@/lib/constants";

/**
 * The left half of the sign-in screen, from `lg` up.
 *
 * A real photograph of the food under a mahogany scrim, not a decorative
 * pattern: the thing being sold is the thing that should be on screen. The
 * three lines underneath are what actually happens after signing in, in the
 * order it happens — concrete enough to be checked, which is the opposite of
 * a row of identical feature cards.
 */
export function AuthBrandPanel() {
  const t = useT();

  const points = [
    { icon: Wallet, text: t.auth.panelPointPay },
    { icon: Clock, text: t.auth.panelPointTrack },
    { icon: QrCode, text: t.auth.panelPointToken },
  ];

  return (
    <aside className="relative hidden overflow-hidden lg:flex lg:w-[46%] lg:shrink-0">
      <Image
        src="/images/hero/burger-combo.webp"
        alt=""
        fill
        sizes="46vw"
        priority
        className="object-cover"
      />
      {/* Cocoa, the dark brand fill, so white text clears AA against the photograph beneath. */}
      <div aria-hidden="true" className="absolute inset-0 bg-cocoa/90" />

      <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
        <Wordmark className="h-6" tone="light" />

        <div className="max-w-[26rem]">
          <h2 className="font-display text-3xl leading-tight font-extrabold text-white xl:text-4xl">
            {t.auth.panelHeading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80">{t.auth.panelBody}</p>

          <ul className="mt-8 grid gap-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-mustard"
                >
                  <Icon size={17} strokeWidth={2} />
                </span>
                <span className="text-sm leading-relaxed text-white/85">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="nums text-xs font-semibold tracking-wide text-white/70 uppercase">
          {STORE.addressLine}
        </p>
      </div>
    </aside>
  );
}
