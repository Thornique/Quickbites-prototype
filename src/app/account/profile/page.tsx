"use client";

import Link from "next/link";
import { UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationPreferences } from "@/features/notifications";
import { useT } from "@/i18n";

/**
 * Placeholder. Editing name/phone, changing password and the language
 * preference are built in step 7.
 */
export default function AccountProfilePage() {
  const t = useT();

  return (
    <div>
      <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
        {t.account.profile}
      </h1>
      <EmptyState
        className="mt-8"
        icon={UserCog}
        title="Profile editing arrives in step 7"
        description="You'll be able to update your name and phone, and change your password here."
        action={
          <Button asChild variant="outline">
            <Link href="/account">Back to account</Link>
          </Button>
        }
      />

      <NotificationPreferences className="mt-6" />
    </div>
  );
}
