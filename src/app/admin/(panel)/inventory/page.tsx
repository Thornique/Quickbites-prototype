"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminInventoryPage() {
  const t = useT();

  return (
    <RequireAdmin permission="INVENTORY">
      <ModulePlaceholder title={t.adm.nav.inventory} step={12} />
    </RequireAdmin>
  );
}
