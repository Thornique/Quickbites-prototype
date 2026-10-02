"use client";

import { useLocale, useT } from "@/i18n";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface LanguageToggleProps {
  className?: string;
  /**
   * `dark` is for the admin sign-in page, which sits on an ink background —
   * the light styling leaves the inactive label well below AA contrast there.
   */
  tone?: "light" | "dark";
}

/**
 * EN | हिं segmented switch. Rendered as real radio inputs so it is operable
 * by keyboard and announced as a group, rather than two unlabelled buttons.
 */
export function LanguageToggle({ className, tone = "light" }: LanguageToggleProps) {
  const { locale, setLocale } = useLocale();
  const t = useT();

  const LABELS: Record<Locale, string> = {
    en: t.language.english,
    hi: t.language.hindi,
  };
  const SWITCH_LABELS: Record<Locale, string> = {
    en: t.language.switchToEnglish,
    hi: t.language.switchToHindi,
  };

  return (
    <fieldset
      className={cn(
        "inline-flex items-center rounded-pill border p-0.5",
        tone === "dark" ? "border-white/20 bg-white/5" : "border-hairline bg-surface",
        className,
      )}
    >
      <legend className="sr-only">{t.language.label}</legend>
      {SUPPORTED_LOCALES.map((value) => {
        const isActive = locale === value;
        return (
          <label
            key={value}
            className={cn(
              "relative cursor-pointer rounded-pill px-2.5 py-1 text-xs font-bold transition-colors",
              "focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-1",
              isActive && "bg-brand text-white",
              !isActive &&
                (tone === "dark"
                  ? "text-white/70 hover:text-white"
                  : "text-ink-muted hover:text-ink"),
            )}
          >
            <input
              type="radio"
              name="locale"
              value={value}
              checked={isActive}
              onChange={() => setLocale(value)}
              className="sr-only"
            />
            <span aria-hidden="true">{LABELS[value]}</span>
            <span className="sr-only">{SWITCH_LABELS[value]}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
