"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/lib/constants";
import { LOCALE_KEY, readKey, writeKey } from "@/storage";
import type { LocalizedText } from "@/types";
import { en, type Dictionary } from "./en";
import {
  enNotify,
  type NotificationCopy,
  type NotificationDictionary,
} from "./en-notify";
import { hi } from "./hi";
import { hiNotify } from "./hi-notify";

const DICTIONARIES: Record<Locale, Dictionary> = { en, hi };
const NOTIFY: Record<Locale, NotificationDictionary> = { en: enNotify, hi: hiNotify };

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  /** Reads the right side of a {en,hi} field from the data layer. */
  pick: (text: LocalizedText) => string;
  /** Renders a notification's title/body from its stored type and params. */
  notifyCopy: NotificationDictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Runs before paint in the browser, but falls back to useEffect during SSR so
 * React does not warn about useLayoutEffect on the server.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  /*
    Always start on the default locale. The server and the first client render
    must produce identical markup, so the stored preference is applied in a
    layout effect — before the browser paints, so there is no visible flash of
    the wrong language and no hydration mismatch.
  */
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useIsomorphicLayoutEffect(() => {
    const stored = readKey<string | null>(LOCALE_KEY, null);
    if (isLocale(stored) && stored !== DEFAULT_LOCALE) setLocaleState(stored);
  }, []);

  // Keep <html lang> honest for screen readers and for our :lang(hi) CSS.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // A language change in one tab should follow the reader into the others.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LOCALE_KEY) return;
      try {
        const next = event.newValue ? (JSON.parse(event.newValue) as unknown) : null;
        if (isLocale(next)) setLocaleState(next);
      } catch {
        /* ignore malformed values */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeKey(LOCALE_KEY, next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const t = DICTIONARIES[locale];
    return {
      locale,
      t,
      setLocale,
      pick: (text: LocalizedText) => text[locale] || text.en,
      notifyCopy: NOTIFY[locale],
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside <I18nProvider>.");
  }
  return context;
}

/** The active dictionary: `const t = useT(); t.auth.loginTitle`. */
export function useT(): Dictionary {
  return useI18n().t;
}

/** Current locale plus the setter, for the toggle. */
export function useLocale() {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}

/** Reads a {en,hi} value from the data layer in the active language. */
export function usePick() {
  return useI18n().pick;
}

/**
 * Renders a stored notification into readable text. Kept as a hook so the
 * copy follows the language toggle without the rows being rewritten.
 */
export function useNotificationCopy() {
  const copy = useI18n().notifyCopy;
  return (
    type: keyof NotificationDictionary,
    params: Parameters<NotificationDictionary[typeof type]>[0],
  ): NotificationCopy => copy[type](params);
}

/** Locale-free version for code that already knows the locale. */
export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] || text.en;
}
