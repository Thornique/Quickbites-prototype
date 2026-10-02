"use client";

import Link from "next/link";
import { Bell, Clock, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth";
import { useUnreadCount } from "@/features/notifications";
import { useMyOrders } from "@/features/orders";
import { useT } from "@/i18n";
import { formatDate, formatTime } from "@/lib/format";
import { isActiveStatus } from "@/services/orders";

export default function AccountPage() {
  const t = useT();
  const { user } = useSession();
  const { data: orders, isLoading } = useMyOrders();
  const { data: unread = 0 } = useUnreadCount();

  if (!user) return null;

  const active = (orders ?? []).filter((order) => isActiveStatus(order.status));
  const recent = (orders ?? []).filter((order) => !isActiveStatus(order.status)).slice(0, 3);

  return (
    <div>
      <h1 className="text-display text-3xl text-ink uppercase sm:text-4xl">
        {t.account.greeting(user.name)}
      </h1>
      <p className="mt-2 text-sm text-ink-muted">{t.account.signedInAs(user.email)}</p>

      {unread > 0 && (
        <Link
          href="/account/notifications"
          className="mt-5 inline-flex items-center gap-2 rounded-control border border-brand/30 bg-brand/5 px-3 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
        >
          <Bell size={16} aria-hidden="true" />
          {t.accountPage.unreadNotifications(unread)}
        </Link>
      )}

      {/* What is happening right now. */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-ink">{t.accountPage.activeOrder}</h2>

        {isLoading && <Skeleton className="mt-3 h-28 w-full rounded-card" />}

        {!isLoading && active.length === 0 && (
          <EmptyState
            className="mt-3"
            variant="inline"
            icon={Clock}
            title={t.accountPage.noActivity}
            description={t.accountPage.noActivityBody}
            action={
              <Button asChild variant="outline">
                <Link href="/menu">{t.cartPage.browseMenu}</Link>
              </Button>
            }
          />
        )}

        <ul className="mt-3 grid gap-3">
          {active.map((order) => (
            <li key={order.id}>
              <Link
                href={`/order/${order.id}`}
                className="block rounded-card border border-brand/25 bg-brand/5 p-4 transition-colors hover:border-brand"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="nums text-display text-2xl text-brand">
                      {order.tokenNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {order.orderType === "TAKEAWAY"
                        ? t.orderType.takeaway
                        : t.orderType.dineIn}{" "}
                      · {order.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {order.estimatedReadyAt
                        ? t.track.readyBy(formatTime(order.estimatedReadyAt))
                        : t.track.waitingConfirm}
                    </Badge>
                    <p className="mt-1.5">
                      <Price value={order.total} size="sm" />
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* What happened before. */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">{t.accountPage.recentOrders}</h2>
          <Link
            href="/account/orders"
            className="text-xs font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
          >
            {t.accountPage.seeAll}
          </Link>
        </div>

        {!isLoading && recent.length === 0 && (
          <EmptyState
            className="mt-3"
            variant="inline"
            icon={Receipt}
            title={t.orders.nonePast}
            description={t.orders.nonePastBody}
          />
        )}

        <ul className="mt-3 grid gap-2">
          {recent.map((order) => (
            <li key={order.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="nums text-sm font-semibold text-ink">
                    {order.tokenNumber} · {formatDate(order.createdAt)}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {order.lines.map((line) => line.name.en).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Price value={order.total} size="sm" />
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/order/${order.id}`}>{t.orders.track}</Link>
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
