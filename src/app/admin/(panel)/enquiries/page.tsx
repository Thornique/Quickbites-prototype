"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminEnquiriesPage() {
  const t = useT();

  return (
    <RequireAdmin permission="ENQUIRIES">
      <ModulePlaceholder title={t.adm.nav.enquiries} step={11} />
    </RequireAdmin>
  );
}
