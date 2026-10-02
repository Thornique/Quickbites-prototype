"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useT } from "@/i18n";

/**
 * Placeholder. The real order history — status badges, Active/Past filter,
 * reorder and rating — is built in step 7.
 */
export default function AccountOrdersPage() {
  const t = useT();

  return (
    <div>
      <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
        {t.account.myOrders}
      </h1>
      <EmptyState
        className="mt-8"
        icon={Receipt}
        title="Order history arrives in step 7"
        description="This page will list your past and active orders, with reorder and rating."
        action={
          <Button asChild variant="outline">
            <Link href="/account">Back to account</Link>
          </Button>
        }
      />
    </div>
  );
}
