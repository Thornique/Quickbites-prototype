import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { ContactContent } from "./_contact-content";

const DESCRIPTION =
  "Call, WhatsApp or message Quick Bites at Bombay Bazar, Khandwa. Open 10:00 AM to 11:00 PM, every day.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `Contact · ${STORE.name}`,
    description: DESCRIPTION,
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
