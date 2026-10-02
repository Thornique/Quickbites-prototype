"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

/**
 * Guarded by the SETTINGS permission. The seeded manager does not hold it, so
 * opening this as manager@quickbites.in is how the 403-inside-the-shell path is
 * demonstrated. Real settings arrive in step 12.
 */
export default function AdminSettingsPage() {
  const t = useT();

  return (
    <RequireAdmin permission="SETTINGS">
      <ModulePlaceholder title={t.adm.nav.settings} step={12} />
    </RequireAdmin>
  );
}
