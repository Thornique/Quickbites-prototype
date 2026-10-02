"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminReviewsPage() {
  const t = useT();

  return (
    <RequireAdmin permission="CONTENT">
      <ModulePlaceholder title={t.adm.nav.reviews} step={12} />
    </RequireAdmin>
  );
}
