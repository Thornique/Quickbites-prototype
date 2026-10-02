import type { Metadata } from "next";
import { OPENING_HOURS, STORE } from "@/lib/constants";
import { Bestsellers } from "./_sections/bestsellers";
import { CategoryRail } from "./_sections/category-rail";
import { ComboBand } from "./_sections/combo-band";
import { HeroCarousel } from "./_sections/hero-carousel";
import { HowItWorks } from "./_sections/how-it-works";
import { LocationBlock } from "./_sections/location-block";
import { Offers } from "./_sections/offers";
import { ReadyStrip } from "./_sections/ready-strip";
import { ReviewsPreview } from "./_sections/reviews-preview";
import { SocialGrid } from "./_sections/social-grid";

const DESCRIPTION =
  "Order takeaway from Quick Bites, Bombay Bazar, Khandwa. Burgers, wraps, pizzas, shakes and hot coffee made fresh — ready in about 12 minutes.";

export const metadata: Metadata = {
  title: {
    absolute: `${STORE.name} — Takeaway burgers, pizzas & coffee in Khandwa`,
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `${STORE.name} — Takeaway in Khandwa`,
    description: DESCRIPTION,
    locale: "en_IN",
    images: [
      {
        url: "/images/hero/burger-combo.jpg",
        width: 1600,
        height: 900,
        alt: "A Quick Bites burger and fries combo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${STORE.name} — Takeaway in Khandwa`,
    description: DESCRIPTION,
    images: ["/images/hero/burger-combo.jpg"],
  },
};

/** Restaurant schema, so search results can show hours and location. */
const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: STORE.name,
  description: DESCRIPTION,
  servesCuisine: ["Fast food", "Indian", "Cafe"],
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE.addressLine,
    addressLocality: STORE.city,
    addressRegion: STORE.state,
    postalCode: STORE.pincode,
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: STORE.geo.lat,
    longitude: STORE.geo.lng,
  },
  telephone: `+${STORE.whatsappHref}`,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: OPENING_HOURS.openTime,
      closes: OPENING_HOURS.closeTime,
    },
  ],
  hasMenu: "/menu",
  acceptsReservations: "/book-table",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled object — no user input is interpolated.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />

      <HeroCarousel />
      <ReadyStrip />
      <CategoryRail />
      <Bestsellers />
      <Offers />
      <ComboBand />
      <HowItWorks />
      <ReviewsPreview />
      <SocialGrid />
      <LocationBlock />
    </>
  );
}
