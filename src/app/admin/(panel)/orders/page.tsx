"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminOrdersPage() {
  const t = useT();

  return (
    <RequireAdmin permission="ORDERS">
      <ModulePlaceholder title={t.adm.nav.orders} step={9} />
    </RequireAdmin>
  );
}
