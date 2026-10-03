import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/features/auth";
import { NotificationWatcher } from "@/features/notifications";
import { I18nProvider } from "@/i18n";
import { SITE_URL, STORE } from "@/lib/constants";
import "./globals.css";

/*
  Both faces are self-hosted from src/fonts rather than fetched by
  next/font/google. Google's fetch timed out repeatedly on every dev start and
  every build ("Request timed out after 3000ms, Retrying 1/3"), which is minutes
  of waiting for bytes that never change. These are the same woff2 files Google
  serves, committed to the repo, so dev and CI touch the network zero times.

  Each family is split into a Latin file and a Devanagari file, exactly as
  Google subsets them, and the two are chained in a font stack below. The
  browser takes each glyph from the first file that has it, so Latin text uses
  the small Latin file and Devanagari falls through to the Devanagari one.
  That split matters for more than Hindi: the rupee sign lives in the
  Devanagari subset, so ₹ comes from there even on an English page.
*/

/**
 * Display face — the chunky, rounded voice the headings are set in. One
 * variable file per subset covers the whole 400–800 range, so the three
 * weights we set cost no extra requests.
 */
const balooLatin = localFont({
  src: "../fonts/baloo2-latin-var.woff2",
  weight: "400 800",
  variable: "--font-display-latin",
  display: "swap",
  /*
    No fallback list and no generated metric face on the Latin half. Each of
    those would be appended inside this variable and therefore sit *in front of*
    the Devanagari file in the stack, so a system font would win ₹ and every
    Hindi glyph. The tail of the stack belongs to the Devanagari face below.
  */
  adjustFontFallback: false,
});

const balooDeva = localFont({
  src: "../fonts/baloo2-deva-var.woff2",
  weight: "400 800",
  variable: "--font-display-deva",
  display: "swap",
  /* Last real face in the stack, so the system fallbacks hang off this one. */
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/*
  Mukta ships as static weights. Only 400/500/600/700 are used — nothing in the
  app sets font-light, and the single font-extrabold is on a font-display
  element, so it renders in Baloo.

  These arrays are written out longhand because next/font reads its arguments
  statically: a .map() over a weights array fails the build with "Font loader
  values must be explicitly written literals".
*/
const muktaLatin = localFont({
  src: [
    { path: "../fonts/mukta-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/mukta-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/mukta-latin-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/mukta-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mukta-latin",
  display: "swap",
  adjustFontFallback: false,
});

const muktaDeva = localFont({
  src: [
    { path: "../fonts/mukta-deva-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/mukta-deva-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/mukta-deva-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/mukta-deva-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-mukta-deva",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  /** Resolves relative Open Graph and Twitter image URLs to absolute ones. */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${STORE.name} — Takeaway burgers, pizzas & coffee in Khandwa`,
    template: `%s · ${STORE.name}`,
  },
  description:
    "Order takeaway from Quick Bites, Bombay Bazar, Khandwa. Burgers, wraps, pizzas, shakes and hot coffee made fresh — ready in about 12 minutes.",
  applicationName: STORE.name,
};

export const viewport: Viewport = {
  themeColor: "#D62300",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /*
      The font variables go on <html>, not <body>: base styles set
      `font-family` on the html element, and a var() that is only defined on
      body would make that declaration invalid and fall back to the browser
      serif default.
    */
    <html
      lang="en"
      className={`${balooLatin.variable} ${balooDeva.variable} ${muktaLatin.variable} ${muktaDeva.variable}`}
      suppressHydrationWarning
    >
      <body>
        <I18nProvider>
          <SessionProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <NotificationWatcher />
          </SessionProvider>
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
