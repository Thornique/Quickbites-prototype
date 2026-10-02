import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { RequireCustomer } from "@/features/auth";
import { PayForm } from "./_pay-form";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

export default function PayPage() {
  return (
    <RequireCustomer>
      <Suspense
        fallback={
          <Container className="py-12">
            <Skeleton className="mx-auto h-96 max-w-md rounded-card" />
          </Container>
        }
      >
        <PayForm />
      </Suspense>
    </RequireCustomer>
  );
}
