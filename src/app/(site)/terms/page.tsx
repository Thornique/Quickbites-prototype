import type { Metadata } from "next";
import { LegalPage } from "../_legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "Ordering, ready times, cancellation and refunds at Quick Bites, Khandwa. Draft for client review.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
