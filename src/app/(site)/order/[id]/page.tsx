import type { Metadata } from "next";
import { RequireCustomer } from "@/features/auth";
import { OrderConfirmation } from "./_order-confirmation";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Orders only exist in the browser's storage, so this route is rendered on
 * demand rather than prerendered — there is nothing for the build to know.
 */
export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <RequireCustomer>
      <OrderConfirmation id={id} />
    </RequireCustomer>
  );
}
