import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { ReviewsContent } from "./_reviews-content";

const DESCRIPTION =
  "What Khandwa says about Quick Bites — ratings and reviews from customers who ordered at our Bombay Bazar counter.";

export const metadata: Metadata = {
  title: "Reviews",
  description: DESCRIPTION,
  alternates: { canonical: "/reviews" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `Reviews · ${STORE.name}`,
    description: DESCRIPTION,
  },
};

export default function ReviewsPage() {
  return <ReviewsContent />;
}
