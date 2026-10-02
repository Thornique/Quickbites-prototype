"use client";

import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useSession } from "@/features/auth";
import { NotificationPreferences } from "@/features/notifications";
import { useT } from "@/i18n";
import { can } from "@/lib/permissions";
import { PERMISSIONS } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Placeholder dashboard. The real KPIs, charts and live board arrive in
 * step 9; for now this shows exactly what the signed-in admin may reach, so
 * the permission model can be checked at a glance.
 */
export default function AdminDashboardPage() {
  const t = useT();
  const { user, isSuperAdmin } = useSession();

  if (!user) return null;

  return (
    <div>
      <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
        {t.admin.dashboard}
      </h1>

      <Card className="mt-6 p-5">
        <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t.admin.signedInAs}
        </p>
        <p className="mt-1 text-lg font-semibold text-ink">{user.name}</p>
        <p className="text-sm text-ink-muted">{user.email}</p>
        <div className="mt-3">
          <Badge variant={isSuperAdmin ? "default" : "secondary"}>
            {t.roles[user.role]}
          </Badge>
        </div>
      </Card>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">{t.admin.permissions}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {isSuperAdmin
            ? t.admin.allPermissions
            : user.permissions.length === 0
              ? t.admin.noPermissions
              : null}
        </p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PERMISSIONS.map((permission) => {
            const allowed = can(user, permission);
            return (
              <li
                key={permission}
                className={cn(
                  "flex items-center gap-2.5 rounded-control border px-3 py-2.5 text-sm",
                  allowed
                    ? "border-veg/25 bg-veg/5 text-ink"
                    : "border-hairline bg-sand-50 text-ink-muted",
                )}
              >
                {allowed ? (
                  <Check
                    size={16}
                    strokeWidth={2.25}
                    className="text-veg-dark"
                    aria-hidden="true"
                  />
                ) : (
                  <Minus
                    size={16}
                    strokeWidth={2.25}
                    className="text-ink-muted/60"
                    aria-hidden="true"
                  />
                )}
                <span className="font-medium">{t.permissions[permission]}</span>
                <span className="sr-only">
                  {allowed ? " — allowed" : " — not allowed"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <NotificationPreferences className="mt-8 max-w-xl" />

      <p className="mt-8 text-xs text-ink-muted">
        Placeholder dashboard — KPI cards, charts and the live order board arrive in
        step 9.
      </p>
    </div>
  );
}
