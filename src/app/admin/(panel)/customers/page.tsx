"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminCustomersPage() {
  const t = useT();

  return (
    <RequireAdmin permission="CUSTOMERS">
      <ModulePlaceholder title={t.adm.nav.customers} step={12} />
    </RequireAdmin>
  );
}
