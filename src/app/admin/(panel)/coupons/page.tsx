"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminCouponsPage() {
  const t = useT();

  return (
    <RequireAdmin permission="COUPONS">
      <ModulePlaceholder title={t.adm.nav.coupons} step={12} />
    </RequireAdmin>
  );
}
