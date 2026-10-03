"use client";

import { useMemo } from "react";
import {
  BadgeIndianRupee,
  CalendarClock,
  ClipboardList,
  Flame,
  Receipt,
} from "lucide-react";
import { resolvePreset } from "@/components/admin/date-range-picker";
import { StatCard } from "@/components/admin/stat-card";
import { useSession } from "@/features/auth";
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
 * and a dashboard that answered "₹0 revenue" because of a permission check
 * would be lying to them. Each admin sees the figures they are allowed to see,
 * and nothing where a zero could be mistaken for the truth.
 *
 * These are the standing measures only. Anything an admin must act on lives in
 * the attention panel above, where it can carry a verb and a link — a tile that
 * reads "Overdue 1" states a problem without offering a way to fix it.
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

/** What the counter is carrying right now — ORDERS only. */
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
      label: t.adm.dashboard.scheduledToday,
      value: counts?.scheduledToday ?? 0,
      icon: CalendarClock,
      href: "/admin/orders?view=scheduled",
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

export function KpiGrid() {
  const { user } = useSession();

  return (
    // Two across even on the smallest phone: ten full-width tiles stacked into
    // a scroll was the single worst thing about this screen.
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
      {can(user, "REPORTS") && <MoneyKpis />}
      {can(user, "ORDERS") && <OrderKpis />}
    </div>
  );
}
