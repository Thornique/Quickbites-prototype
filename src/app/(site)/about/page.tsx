import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { AboutContent } from "./_about-content";

const DESCRIPTION =
  "Quick Bites is a single-counter quick-service cafe at Bombay Bazar, Khandwa. Open kitchen, veg and non-veg kept apart, most orders ready in under 15 minutes.";

export const metadata: Metadata = {
  title: "About us",
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `About us · ${STORE.name}`,
    description: DESCRIPTION,
    images: [{ url: "/images/gallery/cafe-counter.webp", width: 800, height: 600 }],
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
