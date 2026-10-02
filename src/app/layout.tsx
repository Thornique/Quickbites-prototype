import type { Metadata, Viewport } from "next";
import { Archivo, Mukta } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/features/auth";
import { I18nProvider } from "@/i18n";
import { STORE } from "@/lib/constants";
import "./globals.css";

/**
 * Display face. The `wdth` axis is requested so headings can use the
 * condensed width (75) via the `.text-display` utility.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
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
  title: {
    default: `${STORE.name} — Takeaway burgers, pizzas & coffee in Khandwa`,
    template: `%s · ${STORE.name}`,
  },
  description:
    "Order takeaway from Quick Bites, Bombay Bazar, Khandwa. Burgers, wraps, pizzas, shakes and hot coffee made fresh — ready in about 12 minutes.",
  applicationName: STORE.name,
};

export const viewport: Viewport = {
  themeColor: "#D7261E",
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
      className={`${archivo.variable} ${mukta.variable}`}
      suppressHydrationWarning
    >
      <body>
        <I18nProvider>
          <SessionProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
