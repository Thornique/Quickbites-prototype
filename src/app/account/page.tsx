"use client";

import { Card } from "@/components/ui/card";
import { useSession } from "@/features/auth";
import { useT } from "@/i18n";
import { formatDate } from "@/lib/format";

/**
 * Placeholder account overview. The real one — active order card, recent
 * orders and saved details — is built in step 7. This exists so the
 * RequireCustomer guard has somewhere to protect.
 */
export default function AccountPage() {
  const t = useT();
  const { user } = useSession();

  if (!user) return null;

  return (
    <div>
      <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
        {t.account.greeting(user.name)}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{t.account.signedInAs(user.email)}</p>

      <Card className="mt-8 p-5">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              {t.auth.phone}
            </dt>
            <dd className="nums mt-1 text-sm text-ink">{user.phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              {t.admin.role}
            </dt>
            <dd className="mt-1 text-sm text-ink">{t.roles[user.role]}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Member since
            </dt>
            <dd className="nums mt-1 text-sm text-ink">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </Card>

      <p className="mt-6 text-xs text-ink-muted">
        Placeholder page — orders, profile and the active-order card arrive in step 7.
      </p>
    </div>
  );
}
