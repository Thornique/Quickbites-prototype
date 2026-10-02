import type { Metadata } from "next";
import { STORE } from "@/lib/constants";
import { GalleryGrid } from "./_gallery-grid";

const DESCRIPTION =
  "Photographs from the Quick Bites counter at Bombay Bazar, Khandwa — the food, the cafe and the events we have fed.";

export const metadata: Metadata = {
  title: "Gallery",
  description: DESCRIPTION,
  alternates: { canonical: "/gallery" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `Gallery · ${STORE.name}`,
    description: DESCRIPTION,
    images: [{ url: "/images/gallery/burger-board.jpg", width: 800, height: 600 }],
  },
};

export default function GalleryPage() {
  return <GalleryGrid />;
}
