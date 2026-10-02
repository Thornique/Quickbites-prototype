"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminCategoriesPage() {
  const t = useT();

  return (
    <RequireAdmin permission="MENU">
      <ModulePlaceholder title={t.adm.nav.categories} step={11} />
    </RequireAdmin>
  );
}
