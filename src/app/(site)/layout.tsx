import { ContactFab } from "@/components/site/contact-fab";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { CartSync } from "@/features/cart";
import { AddToCartProvider } from "@/features/menu/add-to-cart";
import { StickyCartBar } from "@/components/site/sticky-cart-bar";

/**
 * Chrome for every public page. Kept a server component so pages beneath it
 * can export metadata; the header and footer are client components because
 * they read the session, cart and store status.
 *
 * AddToCartProvider sits here rather than on each page: any MenuCard on the
 * site can then be added to the cart, and the whole site shares one customise
 * sheet instead of one per card.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <AddToCartProvider>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <StickyCartBar />
        <ContactFab />
        <CartSync />
      </AddToCartProvider>
    </div>
  );
}
