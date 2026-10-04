import type { Metadata } from "next";
import { OPENING_HOURS, STORE } from "@/lib/constants";
import { OUTLETS } from "@/lib/outlets";
import { Bestsellers } from "./_sections/bestsellers";
import { CategoryRail } from "./_sections/category-rail";
import { ComboBand } from "./_sections/combo-band";
import { HeroCarousel } from "./_sections/hero-carousel";
import { HowItWorks } from "./_sections/how-it-works";
import { LocationBlock } from "./_sections/location-block";
import { Offers } from "./_sections/offers";
import { OutletChoice } from "./_sections/outlet-choice";
import { ReadyStrip } from "./_sections/ready-strip";
import { ReviewsPreview } from "./_sections/reviews-preview";
import { SocialGrid } from "./_sections/social-grid";

const WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DESCRIPTION =
  "Order takeaway from Quick Bites, Khandwa. Burgers, wraps, pizzas and shakes at Bombay Bazar; espresso, frappés and fresh bakes at Quick Bites Coffee on Nagchun Road.";

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
        url: "/images/hero/burger-combo.webp",
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
    images: ["/images/hero/burger-combo.webp"],
  },
};

/**
 * Restaurant schema, so search results can show hours and location. Two
 * outlets now, so this is a graph of two places rather than one.
 */
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
      dayOfWeek: WEEK,
      opens: OPENING_HOURS.openTime,
      closes: OPENING_HOURS.closeTime,
    },
  ],
  hasMenu: "/menu",
  acceptsReservations: "/book-table",
  department: [
    {
      "@type": "CafeOrCoffeeShop",
      name: OUTLETS.coffee.name.en,
      servesCuisine: ["Coffee", "Bakery"],
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Nagchun Road, near Civil Lines",
        addressLocality: STORE.city,
        addressRegion: STORE.state,
        postalCode: STORE.pincode,
        addressCountry: "IN",
      },
      telephone: OUTLETS.coffee.phone,
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: WEEK,
          opens: "07:30",
          closes: "22:30",
        },
      ],
      hasMenu: "/menu?outlet=coffee",
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Static, author-controlled object — no user input is interpolated.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />

      {/* First visit only — a two-card choice above the restaurant's hero. */}
      <OutletChoice />
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
