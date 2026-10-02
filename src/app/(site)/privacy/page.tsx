import type { Metadata } from "next";
import { LegalPage } from "../_legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Quick Bites keeps, where it is stored and how to ask us to delete it. Draft for client review.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />;
}
