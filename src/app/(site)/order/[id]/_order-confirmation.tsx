"use client";

import Link from "next/link";
import { Clock, SearchX, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { VegMark } from "@/components/ui/veg-mark";
import { useOrder } from "@/features/orders";
import { usePick, useT } from "@/i18n";
import { formatDateTime, formatPrice } from "@/lib/format";

/**
 * Minimal confirmation. Step 7 replaces this with the full tracking page —
 * what matters now is that the customer immediately sees the one thing the
 * counter will ask for: their token.
 */
export function OrderConfirmation({ id }: { id: string }) {
  const t = useT();
  const pick = usePick();
  const { data: order, isLoading, error } = useOrder(id);

  if (isLoading) {
    return (
      <Container className="py-12">
        <Skeleton className="mx-auto h-64 max-w-lg rounded-card" />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={SearchX}
          title={t.item.notFoundTitle}
          description={t.item.notFoundBody}
          action={
            <Button asChild>
              <Link href="/menu">{t.item.backToMenu}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const isCash = order.paymentMethod === "CASH";
  const isTakeaway = order.orderType === "TAKEAWAY";

  return (
    <Container className="py-8 pb-16 sm:py-12">
      <div className="mx-auto max-w-lg">
        {/* The token, as large as it is on the counter screen. */}
        <Card className="p-6 text-center">
          <p className="text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
            {t.confirm.tokenLabel}
          </p>
          <p className="text-display nums mt-1 text-[clamp(3rem,18vw,5rem)] leading-none text-brand">
            {order.tokenNumber}
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            {t.confirm.showToken(order.tokenNumber)}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">
              {isTakeaway ? t.orderType.takeaway : t.orderType.dineIn}
            </Badge>
            <Badge variant="muted">{t.confirm.orderNumber(order.id)}</Badge>
            {order.tableNumber && (
              <Badge variant="muted">
                {t.checkout.tableNumber} {order.tableNumber}
              </Badge>
            )}
          </div>
        </Card>

        {/* What has to happen next, stated plainly. */}
        <Card
          className={`mt-4 p-5 ${isCash ? "border-warning/30 bg-warning/10" : "border-brand/25 bg-brand/5"}`}
        >
          <p className="flex items-start gap-3">
            {isCash ? (
              <Wallet
                size={20}
                className="mt-0.5 shrink-0 text-warning-dark"
                aria-hidden="true"
              />
            ) : (
              <Clock
                size={20}
                className="mt-0.5 shrink-0 text-brand"
                aria-hidden="true"
              />
            )}
            <span>
              <span className="block text-sm font-semibold text-ink">
                {isCash
                  ? t.confirm.cashDue(formatPrice(order.total))
                  : t.confirm.awaitingVerification}
              </span>
              <span className="mt-0.5 block text-sm text-ink-muted">
                {isCash ? t.checkout.cashNote : t.confirm.awaitingBody}
              </span>
            </span>
          </p>

          {order.isScheduled && order.scheduledFor && (
            <p className="nums mt-3 border-t border-hairline pt-3 text-sm font-semibold text-ink">
              {t.confirm.scheduledFor(formatDateTime(order.scheduledFor))}
            </p>
          )}
        </Card>

        <Card className="mt-4 p-5">
          <h2 className="text-sm font-semibold text-ink">{t.confirm.yourOrder}</h2>
          <ul className="mt-3 grid gap-2.5">
            {order.lines.map((line, index) => (
              <li
                key={`${line.menuItemId}-${index}`}
                className="flex items-start gap-2.5"
              >
                <VegMark isVeg={line.isVeg} size="sm" className="mt-1" />
                <span className="min-w-0 flex-1">
                  <span className="nums block text-sm text-ink">
                    {line.quantity} × {pick(line.name)}
                  </span>
                  {line.options.length > 0 && (
                    <span className="block text-xs text-ink-muted">
                      {line.options.map((option) => pick(option.name)).join(" · ")}
                    </span>
                  )}
                </span>
                <Price value={line.lineTotal} size="sm" />
              </li>
            ))}
          </ul>

          <dl className="mt-4 grid gap-2 border-t border-hairline pt-4">
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-ink-muted">{t.cartPage.subtotal}</dt>
              <dd>
                <Price value={order.subtotal} size="sm" />
              </dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-ink-muted">
                  {order.couponCode
                    ? t.cartPage.discountWithCode(order.couponCode)
                    : t.cartPage.discount}
                </dt>
                <dd className="nums text-sm font-semibold text-veg-dark">
                  −{formatPrice(order.discount)}
                </dd>
              </div>
            )}
            {order.packagingCharge > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-sm text-ink-muted">{t.cartPage.packaging}</dt>
                <dd>
                  <Price value={order.packagingCharge} size="sm" />
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-ink-muted">
                {t.cartPage.gst(order.taxRate)}
              </dt>
              <dd>
                <Price value={order.tax} size="sm" />
              </dd>
            </div>
            <div className="mt-1 flex justify-between gap-4 border-t border-hairline pt-3">
              <dt className="text-base font-semibold text-ink">{t.cartPage.total}</dt>
              <dd>
                <Price value={order.total} size="xl" />
              </dd>
            </div>
          </dl>
        </Card>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button asChild variant="outline">
            <Link href="/account/orders">{t.account.myOrders}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/menu">{t.item.backToMenu}</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
