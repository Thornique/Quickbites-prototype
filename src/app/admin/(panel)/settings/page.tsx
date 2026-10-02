"use client";

import { Card } from "@/components/ui/card";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

/**
 * Placeholder guarded by the SETTINGS permission. The seeded manager does not
 * hold it, so opening this as manager@quickbites.in is how the 403-inside-the-
 * shell path is demonstrated. Real settings arrive in step 12.
 */
export default function AdminSettingsPage() {
  const t = useT();

  return (
    <RequireAdmin permission="SETTINGS">
      <div>
        <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
          {t.admin.settings}
        </h1>
        <Card className="mt-6 p-5">
          <p className="text-sm text-ink-muted">
            Placeholder — store hours, prep-time config, charges and the demo reset
            arrive in step 12. You can see this page because your account holds the{" "}
            <strong className="font-semibold text-ink">{t.permissions.SETTINGS}</strong>{" "}
            permission.
          </p>
        </Card>
      </div>
    </RequireAdmin>
  );
}
