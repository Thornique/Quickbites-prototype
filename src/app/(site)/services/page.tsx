import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { ServicesContent } from "./_services-content";

const DESCRIPTION =
  "Party and bulk orders, birthday and office catering, and daily corporate lunch boxes from Quick Bites, Khandwa.";

export const metadata: Metadata = {
  title: "Party & bulk orders",
  description: DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `Party & bulk orders · ${STORE.name}`,
    description: DESCRIPTION,
    images: [{ url: "/images/hero/burger-combo.webp", width: 800, height: 600 }],
  },
};

export default function ServicesPage() {
  return <ServicesContent />;
}
