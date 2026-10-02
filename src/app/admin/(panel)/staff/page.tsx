"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

/**
 * Restricted to the single SUPER_ADMIN. Staff management is never a
 * per-permission module — services/staff.ts refuses anyone else — so the guard
 * uses superAdminOnly rather than a permission. Real CRUD in step 12.
 */
export default function AdminStaffPage() {
  const t = useT();

  return (
    <RequireAdmin superAdminOnly>
      <ModulePlaceholder title={t.adm.nav.staff} step={12} />
    </RequireAdmin>
  );
}
