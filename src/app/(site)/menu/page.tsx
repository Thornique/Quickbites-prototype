import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { STORE } from "@/lib/constants";
import { MenuClient } from "./_components/menu-client";

const DESCRIPTION =
  "Burgers, wraps, pizzas, fries, hot coffee, shakes and desserts from ₹49. Takeaway is prepaid online; dine in and pay online or at the counter.";

export const metadata: Metadata = {
  title: "Menu",
  description: DESCRIPTION,
  alternates: { canonical: "/menu" },
  openGraph: {
    type: "website",
    siteName: STORE.name,
    title: `Menu · ${STORE.name}`,
    description: DESCRIPTION,
    images: [{ url: "/images/menu/farmhouse-pizza.jpg", width: 800, height: 600 }],
  },
};

function MenuSkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-4 h-10 w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-card" />
        ))}
      </div>
    </Container>
  );
}

export default function MenuPage() {
  // useSearchParams drives the filters, so the client half needs a boundary.
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuClient />
    </Suspense>
  );
}
