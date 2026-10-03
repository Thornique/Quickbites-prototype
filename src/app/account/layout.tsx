import { AccountRail } from "@/components/site/account-rail";
import { ContactFab } from "@/components/site/contact-fab";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { Container } from "@/components/ui/container";
import { CartSync } from "@/features/cart";
import { RequireCustomer } from "@/features/auth";
import { AddToCartProvider } from "@/features/menu/add-to-cart";

/**
 * Everything under /account needs a signed-in customer.
 *
 * It wears the same header and footer as the rest of the site — the account
 * area is part of the site, not a separate app — with the section rail on the
 * left and the page beside it, which is the layout the big chains use.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <AddToCartProvider>
        <SiteHeader />

        <RequireCustomer>
          <main id="main" className="flex-1 py-6 sm:py-10">
            <Container className="grid items-start gap-6 lg:grid-cols-[18rem_1fr] lg:gap-10">
              <AccountRail />
              <div className="min-w-0">{children}</div>
            </Container>
          </main>
        </RequireCustomer>

        <SiteFooter />
        <ContactFab />
        <CartSync />
      </AddToCartProvider>
    </div>
  );
}
