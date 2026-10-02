"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminReportsPage() {
  const t = useT();

  return (
    <RequireAdmin permission="REPORTS">
      <ModulePlaceholder title={t.adm.nav.reports} step={12} />
    </RequireAdmin>
  );
}
