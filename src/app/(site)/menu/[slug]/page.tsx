import type { Metadata } from "next";
import { SEED_MENU_ITEMS } from "@/data/seed/menu-items";
import { STORE } from "@/lib/constants";
import { ItemDetail } from "./_item-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-renders every seeded item so each has a real, shareable URL.
 *
 * Items an admin adds later are not in this list, so the route falls back to
 * rendering on demand and the client half resolves the slug from localStorage
 * — which is where the live menu actually lives.
 *
 * Slugs are unique within an outlet, not across both — both counters sell a
 * "cold-coffee" — so the list is de-duplicated. The page resolves which of
 * the two to show from the active outlet on the client.
 */
export function generateStaticParams() {
  return [...new Set(SEED_MENU_ITEMS.map((item) => item.slug))].map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  /*
    Where a slug exists at both outlets, the restaurant's copy supplies the
    shared metadata: it is the default outlet, so it is what a cold visitor
    following the link is shown first.
  */
  const matches = SEED_MENU_ITEMS.filter((candidate) => candidate.slug === slug);
  const item =
    matches.find((candidate) => candidate.outletId === "restaurant") ?? matches[0];

  if (!item) {
    return { title: "Menu item", robots: { index: false, follow: true } };
  }

  const image = item.images[0];
  return {
    title: item.name.en,
    description: item.description.en,
    alternates: { canonical: `/menu/${item.slug}` },
    openGraph: {
      type: "website",
      siteName: STORE.name,
      title: `${item.name.en} · ${STORE.name}`,
      description: item.description.en,
      images: image ? [{ url: image, width: 800, height: 600, alt: item.name.en }] : [],
    },
  };
}

export default async function MenuItemPage({ params }: PageProps) {
  const { slug } = await params;
  return <ItemDetail slug={slug} />;
}
