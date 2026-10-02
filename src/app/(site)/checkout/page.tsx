import type { Metadata } from "next";
import { RequireCustomer } from "@/features/auth";
import { CheckoutForm } from "./_checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <RequireCustomer>
      <CheckoutForm />
    </RequireCustomer>
  );
}
