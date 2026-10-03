import type { Metadata, Viewport } from "next";
import { Baloo_2, Mukta } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/features/auth";
import { NotificationWatcher } from "@/features/notifications";
import { I18nProvider } from "@/i18n";
import { SITE_URL, STORE } from "@/lib/constants";
import "./globals.css";

/**
 * Display face — the chunky, rounded voice the headings are set in.
 *
 * It carries Devanagari as well as Latin, so an English and a Hindi heading
 * are the same typeface rather than two faces pretending to match. That is
 * also why the display utility needs no separate Hindi branch any more.
 */
const baloo = Baloo_2({
  subsets: ["latin", "devanagari"],
  weight: ["600", "700", "800"],
  variable: "--font-display-face",
  display: "swap",
});

/** Body/UI face — covers Latin and Devanagari so EN and HI look consistent. */
const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-mukta",
  display: "swap",
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
      className={`${baloo.variable} ${mukta.variable}`}
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
