import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { PricingContent } from "./_pricing-content";

const DESCRIPTION =
  "Combo meal prices and party packs for 10, 25 or 50 people at Quick Bites, Bombay Bazar, Khandwa. All prices include GST.";

export const metadata: Metadata = {
  title: "Prices",
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `Prices · ${STORE.name}`,
    description: DESCRIPTION,
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
