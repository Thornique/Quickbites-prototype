"use client";

import { Card } from "@/components/ui/card";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

/**
 * Placeholder restricted to the single SUPER_ADMIN. Staff management is never
 * a per-permission module — services/staff.ts refuses anyone else — so the
 * guard uses superAdminOnly rather than a permission. Real CRUD in step 12.
 */
export default function AdminStaffPage() {
  const t = useT();

  return (
    <RequireAdmin superAdminOnly>
      <div>
        <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
          {t.admin.staff}
        </h1>
        <Card className="mt-6 p-5">
          <p className="text-sm text-ink-muted">
            Placeholder — admin accounts, permission checkboxes and the activity log
            arrive in step 12. Only the super admin can open this page, and the super
            admin account itself can never be deleted, deactivated or demoted.
          </p>
        </Card>
      </div>
    </RequireAdmin>
  );
}
