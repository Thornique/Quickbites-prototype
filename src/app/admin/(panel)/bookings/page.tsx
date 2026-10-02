"use client";

import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { RequireAdmin } from "@/features/auth";
import { useT } from "@/i18n";

export default function AdminBookingsPage() {
  const t = useT();

  return (
    <RequireAdmin permission="BOOKINGS">
      <ModulePlaceholder title={t.adm.nav.bookings} step={11} />
    </RequireAdmin>
  );
}
