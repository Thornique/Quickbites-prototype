"use client";

import { useMemo } from "react";
import {
  AlarmClock,
  BadgeIndianRupee,
  CalendarClock,
  ClipboardList,
  Clock,
  CreditCard,
  Flame,
  MessageSquare,
  Receipt,
  Wallet,
} from "lucide-react";
import { resolvePreset } from "@/components/admin/date-range-picker";
import { StatCard } from "@/components/admin/stat-card";
import { useSession } from "@/features/auth";
import { useBookings } from "@/features/bookings";
import { useEnquiries } from "@/features/enquiries";
import { useOperationalCounts } from "@/features/orders";
import { useDashboardKpis, useRevenueByDay } from "@/features/reports";
import { useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { can } from "@/lib/permissions";

/**
 * The numbers at the top of the dashboard, split by the permission that owns
 * them rather than fetched in one call.
 *
 * It matters: the seeded manager runs orders but holds no REPORTS permission,
 * and a dashboard that answered "₹0 revenue, 0 orders to verify" because of a
 * permission check would be lying to them. Each admin sees the figures they are
 * allowed to see, and nothing where a zero could be mistaken for the truth.
 */

/** Money — REPORTS only. */
function MoneyKpis() {
  const t = useT();
  const { data: kpis, isLoading } = useDashboardKpis();
  // A 30-day series so revenue can carry a sparkline.
  const range = useMemo(() => resolvePreset("last30"), []);
  const { data: revenueByDay } = useRevenueByDay(range);

  const cards = [
    {
      label: t.adm.dashboard.todayRevenue,
      value: formatPrice(kpis?.todayRevenue ?? 0),
      icon: BadgeIndianRupee,
      series: (revenueByDay ?? []).map((day) => day.revenue),
    },
    {
      label: t.adm.dashboard.todayOrders,
      value: kpis?.todayOrders ?? 0,
      icon: Receipt,
    },
    {
      label: t.adm.dashboard.averageOrderValue,
      value: formatPrice(kpis?.averageOrderValue ?? 0),
      icon: ClipboardList,
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <StatCard key={card.label} isLoading={isLoading} {...card} />
      ))}
    </>
  );
}

/** Work waiting on the counter — ORDERS only. */
function OrderKpis() {
  const t = useT();
  const { data: counts, isLoading } = useOperationalCounts();

  const cards = [
    {
      label: t.adm.dashboard.activeOrders,
      value: counts?.active ?? 0,
      icon: Flame,
      href: "/admin/orders",
    },
    {
      label: t.adm.dashboard.awaitingVerification,
      value: counts?.awaitingVerification ?? 0,
      icon: CreditCard,
      href: "/admin/orders",
      tone: (counts?.awaitingVerification ?? 0) > 0 ? ("warning" as const) : undefined,
    },
    {
      label: t.adm.dashboard.cashToCollect,
      value: counts?.cashPending ?? 0,
      icon: Wallet,
      href: "/admin/orders",
      tone: (counts?.cashPending ?? 0) > 0 ? ("warning" as const) : undefined,
    },
    {
      label: t.adm.dashboard.scheduledToday,
      value: counts?.scheduledToday ?? 0,
      icon: CalendarClock,
      href: "/admin/orders?view=scheduled",
    },
    {
      label: t.adm.dashboard.overdue,
      value: counts?.overdue ?? 0,
      icon: AlarmClock,
      href: "/admin/orders",
      tone: (counts?.overdue ?? 0) > 0 ? ("danger" as const) : undefined,
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <StatCard key={card.label} isLoading={isLoading} {...card} />
      ))}
    </>
  );
}

function BookingsKpi() {
  const t = useT();
  const { data: bookings, isLoading } = useBookings({ status: "PENDING" });
  const count = (bookings ?? []).length;

  return (
    <StatCard
      label={t.adm.dashboard.pendingBookings}
      value={count}
      icon={Clock}
      href="/admin/bookings"
      tone={count > 0 ? "warning" : undefined}
      isLoading={isLoading}
    />
  );
}

function EnquiriesKpi() {
  const t = useT();
  const { data: enquiries, isLoading } = useEnquiries("NEW");
  const count = (enquiries ?? []).length;

  return (
    <StatCard
      label={t.adm.dashboard.newEnquiries}
      value={count}
      icon={MessageSquare}
      href="/admin/enquiries"
      tone={count > 0 ? "warning" : undefined}
      isLoading={isLoading}
    />
  );
}

export function KpiGrid() {
  const { user } = useSession();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {can(user, "REPORTS") && <MoneyKpis />}
      {can(user, "ORDERS") && <OrderKpis />}
      {can(user, "BOOKINGS") && <BookingsKpi />}
      {can(user, "ENQUIRIES") && <EnquiriesKpi />}
    </div>
  );
}
