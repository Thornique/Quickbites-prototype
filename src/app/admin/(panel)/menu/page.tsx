"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminMenuPage() {
  const t = useT();

  return (
    <RequireAdmin permission="MENU">
      <ModulePlaceholder title={t.adm.nav.menu} step={11} />
    </RequireAdmin>
  );
}
