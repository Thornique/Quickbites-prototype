import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { BookTableContent } from "./_book-table-content";

const DESCRIPTION =
  "Reserve a table at Quick Bites, Bombay Bazar, Khandwa. Pick a date in the next two weeks, a time slot and your party size.";

export const metadata: Metadata = {
  title: "Book a table",
  description: DESCRIPTION,
  alternates: { canonical: "/book-table" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `Book a table · ${STORE.name}`,
    description: DESCRIPTION,
    images: [{ url: "/images/gallery/cafe-seating.jpg", width: 800, height: 600 }],
  },
};

export default function BookTablePage() {
  return <BookTableContent />;
}
