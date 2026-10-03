"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MessageSquare,
  PackageOpen,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth";
import { useBookings } from "@/features/bookings";
import { useEnquiries } from "@/features/enquiries";
import { useLowStock } from "@/features/inventory";
import { useOperationalCounts } from "@/features/orders";
import { useT } from "@/i18n";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/**
 * The one panel an admin reads first: everything the cafe is waiting on them
 * for, worst first, each row a link to the screen that can clear it.
 *
 * It only ever shows work that exists. A dashboard that lists "0 payments to
 * verify" next to "1 order overdue" makes the admin do the filtering; this
 * does it for them, and says so plainly when there is nothing left.
 *
 * Each source is its own component because the services refuse a read the
 * admin has no permission for — a manager without BOOKINGS must not even ask.
 * They report their row count upwards so the panel knows when it is empty.
 */

type Tone = "danger" | "warning" | "info";

interface RowProps {
  icon: LucideIcon;
  label: string;
  hint: string;
  href: string;
  count: number;
  tone: Tone;
}

const TONE_RING: Record<Tone, string> = {
  danger: "bg-danger/10 text-danger",
  warning: "bg-warning/10 text-warning-dark",
  info: "bg-brand/10 text-brand",
};

function AttentionRow({ icon: Icon, label, hint, href, count, tone }: RowProps) {
  return (
    // min-w-0: the hint never wraps, so without it the grid column sizes to the
    // whole sentence and pushes the page sideways on a phone.
    <li className="min-w-0">
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-control border border-transparent px-3 py-2.5 transition-colors",
          "hover:border-hairline hover:bg-sand-50",
          "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:outline-none",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
            TONE_RING[tone],
          )}
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">{label}</span>
          {/* Two lines on a phone, one on a wide row — a hint cut to "Takeaway
              orders stay on hold …" is worse than no hint. */}
          <span className="line-clamp-2 text-xs text-ink-muted sm:line-clamp-1">
            {hint}
          </span>
        </span>

        <span
          className={cn(
            "nums shrink-0 rounded-pill px-2 py-0.5 text-xs font-bold",
            TONE_RING[tone],
          )}
        >
          {count}
        </span>
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-ink-muted/60 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

/**
 * Lets each source tell the panel how many rows it contributed. `null` means
 * "still reading", so the panel can hold the headline back rather than claim
 * all is clear a frame before the numbers arrive.
 */
type Report = (key: string, count: number | null) => void;

/** Reports after commit — a child may not set parent state during render. */
function useReport(report: Report, key: string, count: number | null): void {
  useEffect(() => report(key, count), [report, key, count]);
}

function OrderRows({ report }: { report: Report }) {
  const t = useT();
  const { data, isLoading } = useOperationalCounts();

  const overdue = data?.overdue ?? 0;
  const verify = data?.awaitingVerification ?? 0;
  const cash = data?.cashPending ?? 0;
  useReport(
    report,
    "orders",
    isLoading ? null : (overdue > 0 ? 1 : 0) + (verify > 0 ? 1 : 0) + (cash > 0 ? 1 : 0),
  );

  return (
    <>
      {overdue > 0 && (
        <AttentionRow
          icon={AlarmClock}
          tone="danger"
          count={overdue}
          href="/admin/orders"
          label={t.adm.dashboard.actOverdue(overdue)}
          hint={t.adm.dashboard.actOverdueHint}
        />
      )}
      {verify > 0 && (
        <AttentionRow
          icon={CreditCard}
          tone="warning"
          count={verify}
          href="/admin/orders"
          label={t.adm.dashboard.actVerify(verify)}
          hint={t.adm.dashboard.actVerifyHint}
        />
      )}
      {cash > 0 && (
        <AttentionRow
          icon={Wallet}
          tone="warning"
          count={cash}
          href="/admin/orders"
          label={t.adm.dashboard.actCash(cash)}
          hint={t.adm.dashboard.actCashHint}
        />
      )}
    </>
  );
}

function BookingRow({ report }: { report: Report }) {
  const t = useT();
  const { data, isLoading } = useBookings({ status: "PENDING" });
  const count = (data ?? []).length;
  useReport(report, "bookings", isLoading ? null : count > 0 ? 1 : 0);

  if (count === 0) return null;
  return (
    <AttentionRow
      icon={CalendarClock}
      tone="info"
      count={count}
      href="/admin/bookings"
      label={t.adm.dashboard.actBookings(count)}
      hint={t.adm.dashboard.actBookingsHint}
    />
  );
}

function EnquiryRow({ report }: { report: Report }) {
  const t = useT();
  const { data, isLoading } = useEnquiries("NEW");
  const count = (data ?? []).length;
  useReport(report, "enquiries", isLoading ? null : count > 0 ? 1 : 0);

  if (count === 0) return null;
  return (
    <AttentionRow
      icon={MessageSquare}
      tone="info"
      count={count}
      href="/admin/enquiries"
      label={t.adm.dashboard.actEnquiries(count)}
      hint={t.adm.dashboard.actEnquiriesHint}
    />
  );
}

function StockRow({ report }: { report: Report }) {
  const t = useT();
  const { data, isLoading } = useLowStock();
  const count = (data ?? []).length;
  useReport(report, "stock", isLoading ? null : count > 0 ? 1 : 0);

  if (count === 0) return null;
  return (
    <AttentionRow
      icon={PackageOpen}
      tone="warning"
      count={count}
      href="/admin/inventory"
      label={t.adm.dashboard.actRestock(count)}
      hint={t.adm.dashboard.actRestockHint}
    />
  );
}

export function AttentionPanel() {
  const t = useT();
  const { user } = useSession();
  const [counts, setCounts] = useState<Record<string, number | null>>({});

  const report = useCallback<Report>((key, count) => {
    setCounts((current) =>
      current[key] === count ? current : { ...current, [key]: count },
    );
  }, []);

  // Every source the admin is allowed to see has to answer before the panel
  // can say anything about the whole picture.
  const sources = [
    can(user, "ORDERS") && "orders",
    can(user, "BOOKINGS") && "bookings",
    can(user, "ENQUIRIES") && "enquiries",
    can(user, "INVENTORY") && "stock",
  ].filter((key): key is string => typeof key === "string");

  const isLoading = sources.some((key) => counts[key] == null);
  const total = sources.reduce((sum, key) => sum + (counts[key] ?? 0), 0);

  return (
    <Card
      className={cn("p-4", !isLoading && total === 0 && "border-veg/25 bg-veg/5")}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold text-ink">
          {!isLoading && total === 0
            ? t.adm.dashboard.allClear
            : t.adm.dashboard.attention}
        </h2>
        {total > 0 && (
          <span className="nums text-xs font-semibold text-ink-muted">
            {t.adm.dashboard.attentionCount(total)}
          </span>
        )}
      </div>

      {isLoading && <Skeleton className="mt-2 h-12 w-full" />}

      {!isLoading && total === 0 && (
        <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
          <CheckCircle2
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="shrink-0 text-veg"
          />
          {t.adm.dashboard.allClearBody}
        </p>
      )}

      {/* Mounted even with no rows, so every source keeps reporting its count. */}
      <ul
        className={cn(
          "grid grid-cols-1 gap-1",
          total > 0 ? "mt-2 sm:grid-cols-2" : "hidden",
        )}
      >
        {can(user, "ORDERS") && <OrderRows report={report} />}
        {can(user, "BOOKINGS") && <BookingRow report={report} />}
        {can(user, "ENQUIRIES") && <EnquiryRow report={report} />}
        {can(user, "INVENTORY") && <StockRow report={report} />}
      </ul>
    </Card>
  );
}
