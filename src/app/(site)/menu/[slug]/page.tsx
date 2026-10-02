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
 */
export function generateStaticParams() {
  return SEED_MENU_ITEMS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = SEED_MENU_ITEMS.find((candidate) => candidate.slug === slug);

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
