import { toDateKey } from "@/lib/format";
import { readCollection } from "@/storage";
import type {
  ActivityLogEntry,
  Coupon,
  Enquiry,
  MenuItem,
  Order,
  OrderType,
  OutletId,
  PaymentMethod,
  TableBooking,
  User,
} from "@/types";
import { OUTLET_IDS } from "@/types";
import { flagsFor } from "./orders";
import { ready, requirePermission } from "./common";
import { adminReadScope } from "./outlets";

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * A reporting window, optionally narrowed to one outlet. Leaving `outletId`
 * unset is the super admin's combined view; an assigned admin is narrowed to
 * their own outlet whatever they ask for.
 */
export interface ReportScope extends DateRange {
  outletId?: OutletId;
}

/** Orders that actually earned money — cancellations never count as sales. */
function salesOrders(range: ReportScope): Order[] {
  const from = range.from.getTime();
  const to = range.to.getTime();
  const outletId = adminReadScope(range.outletId);
  return readCollection<Order>("orders").filter((order) => {
    if (order.status === "CANCELLED") return false;
    if (outletId && order.outletId !== outletId) return false;
    const at = Date.parse(order.createdAt);
    return at >= from && at <= to;
  });
}

export interface SalesSummary {
  grossSales: number;
  discounts: number;
  tax: number;
  packaging: number;
  netSales: number;
  orderCount: number;
  itemCount: number;
  averageOrderValue: number;
}

function summarise(orders: Order[]): SalesSummary {
  const grossSales = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const discounts = orders.reduce((sum, o) => sum + o.discount, 0);
  const tax = orders.reduce((sum, o) => sum + o.tax, 0);
  const packaging = orders.reduce((sum, o) => sum + o.packagingCharge, 0);
  const total = orders.reduce((sum, o) => sum + o.total, 0);

  return {
    grossSales,
    discounts,
    tax,
    packaging,
    netSales: grossSales - discounts,
    orderCount: orders.length,
    itemCount: orders.reduce((sum, o) => sum + o.itemCount, 0),
    averageOrderValue: orders.length === 0 ? 0 : Math.round(total / orders.length),
  };
}

export interface ComparedSummary {
  current: SalesSummary;
  previous: SalesSummary;
  /** Percentage change in net sales vs the previous period of equal length. */
  netSalesDelta: number;
}

export async function getSalesSummary(range: ReportScope): Promise<ComparedSummary> {
  await ready();
  requirePermission("REPORTS");

  const current = summarise(salesOrders(range));
  const span = range.to.getTime() - range.from.getTime();
  const previous = summarise(
    salesOrders({
      outletId: range.outletId,
      from: new Date(range.from.getTime() - span),
      to: new Date(range.from.getTime() - 1),
    }),
  );

  const netSalesDelta =
    previous.netSales === 0
      ? current.netSales > 0
        ? 100
        : 0
      : Math.round(((current.netSales - previous.netSales) / previous.netSales) * 100);

  return { current, previous, netSalesDelta };
}

/**
 * The same figures split per outlet, for the combined "All outlets" report —
 * a single total hides which counter is actually carrying the day.
 */
export async function getSalesByOutlet(
  range: ReportScope,
): Promise<Array<{ outletId: OutletId; summary: SalesSummary }>> {
  await ready();
  requirePermission("REPORTS");

  return OUTLET_IDS.filter((id) => {
    const scope = adminReadScope(range.outletId);
    return !scope || scope === id;
  }).map((outletId) => ({
    outletId,
    summary: summarise(salesOrders({ ...range, outletId })),
  }));
}

/** Net sales per day, for the 30-day revenue line chart. */
export async function getRevenueByDay(
  range: ReportScope,
): Promise<Array<{ date: string; revenue: number; orders: number }>> {
  await ready();
  requirePermission("REPORTS");

  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (
    let d = new Date(range.from);
    d.getTime() <= range.to.getTime();
    d.setDate(d.getDate() + 1)
  ) {
    buckets.set(toDateKey(d), { revenue: 0, orders: 0 });
  }

  for (const order of salesOrders(range)) {
    const key = toDateKey(order.createdAt);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.revenue += order.total;
      bucket.orders += 1;
    }
  }

  return [...buckets.entries()].map(([date, value]) => ({ date, ...value }));
}

/** Orders per hour, for the "today vs average" bar chart and the heatmap. */
export async function getOrdersByHour(range: ReportScope): Promise<number[]> {
  await ready();
  requirePermission("REPORTS");

  const hours = new Array<number>(24).fill(0);
  for (const order of salesOrders(range)) {
    hours[new Date(order.createdAt).getHours()] += 1;
  }
  return hours;
}

/** Day × hour grid for the sales heatmap. Index [weekday][hour]. */
export async function getSalesHeatmap(range: ReportScope): Promise<number[][]> {
  await ready();
  requirePermission("REPORTS");

  const grid = Array.from({ length: 7 }, () => new Array<number>(24).fill(0));
  for (const order of salesOrders(range)) {
    const at = new Date(order.createdAt);
    grid[at.getDay()][at.getHours()] += order.total;
  }
  return grid;
}

export interface ItemPerformance {
  menuItemId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export async function getItemPerformance(
  range: ReportScope,
): Promise<ItemPerformance[]> {
  await ready();
  requirePermission("REPORTS");

  const totals = new Map<string, ItemPerformance>();
  for (const order of salesOrders(range)) {
    for (const line of order.lines) {
      const existing = totals.get(line.menuItemId) ?? {
        menuItemId: line.menuItemId,
        name: line.name.en,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += line.quantity;
      existing.revenue += line.lineTotal;
      totals.set(line.menuItemId, existing);
    }
  }
  return [...totals.values()].sort((a, b) => b.quantity - a.quantity);
}

export async function getCategoryShare(
  range: ReportScope,
): Promise<Array<{ categoryId: string; revenue: number }>> {
  await ready();
  requirePermission("REPORTS");

  const categoryByItem = new Map(
    readCollection<MenuItem>("menuItems").map((i) => [i.id, i.categoryId]),
  );
  const totals = new Map<string, number>();

  for (const order of salesOrders(range)) {
    for (const line of order.lines) {
      const categoryId = categoryByItem.get(line.menuItemId) ?? "unknown";
      totals.set(categoryId, (totals.get(categoryId) ?? 0) + line.lineTotal);
    }
  }
  return [...totals.entries()]
    .map(([categoryId, revenue]) => ({ categoryId, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getPaymentSplit(
  range: ReportScope,
): Promise<Array<{ method: PaymentMethod; count: number; revenue: number }>> {
  await ready();
  requirePermission("REPORTS");

  const totals = new Map<PaymentMethod, { count: number; revenue: number }>();
  for (const order of salesOrders(range)) {
    const existing = totals.get(order.paymentMethod) ?? { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += order.total;
    totals.set(order.paymentMethod, existing);
  }
  return [...totals.entries()].map(([method, value]) => ({ method, ...value }));
}

export async function getCouponPerformance(
  range: ReportScope,
): Promise<
  Array<{ code: string; uses: number; discountGiven: number; revenue: number }>
> {
  await ready();
  requirePermission("REPORTS");

  const scope = adminReadScope(range.outletId);
  const coupons = readCollection<Coupon>("coupons").filter(
    (c) => !scope || c.outletId === scope,
  );
  const totals = new Map<
    string,
    { uses: number; discountGiven: number; revenue: number }
  >();

  for (const order of salesOrders(range)) {
    if (!order.couponCode) continue;
    const existing = totals.get(order.couponCode) ?? {
      uses: 0,
      discountGiven: 0,
      revenue: 0,
    };
    existing.uses += 1;
    existing.discountGiven += order.discount;
    existing.revenue += order.total;
    totals.set(order.couponCode, existing);
  }

  return coupons
    .map((c) => ({
      code: c.code,
      ...(totals.get(c.code) ?? { uses: 0, discountGiven: 0, revenue: 0 }),
    }))
    .sort((a, b) => b.uses - a.uses);
}

/**
 * New vs returning in the period. "New" means their first-ever order falls
 * inside the range, not merely that they ordered during it.
 */
export async function getCustomerMix(range: ReportScope): Promise<{
  newCustomers: number;
  returningCustomers: number;
}> {
  await ready();
  requirePermission("REPORTS");

  const outletId = adminReadScope(range.outletId);
  const all = readCollection<Order>("orders").filter(
    (o) => o.status !== "CANCELLED" && (!outletId || o.outletId === outletId),
  );
  const firstOrderAt = new Map<string, number>();
  for (const order of all) {
    const at = Date.parse(order.createdAt);
    const current = firstOrderAt.get(order.customerId);
    if (current === undefined || at < current) firstOrderAt.set(order.customerId, at);
  }

  const inRange = new Set(salesOrders(range).map((o) => o.customerId));
  let newCustomers = 0;
  let returningCustomers = 0;

  for (const customerId of inRange) {
    const first = firstOrderAt.get(customerId) ?? 0;
    if (first >= range.from.getTime() && first <= range.to.getTime()) newCustomers += 1;
    else returningCustomers += 1;
  }
  return { newCustomers, returningCustomers };
}

/** Revenue and order count split by takeaway vs dine-in. */
export async function getOrderTypeSplit(
  range: ReportScope,
): Promise<Array<{ orderType: OrderType; count: number; revenue: number }>> {
  await ready();
  requirePermission("REPORTS");

  const totals = new Map<OrderType, { count: number; revenue: number }>();
  for (const order of salesOrders(range)) {
    const existing = totals.get(order.orderType) ?? { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += order.total;
    totals.set(order.orderType, existing);
  }
  return [...totals.entries()].map(([orderType, value]) => ({ orderType, ...value }));
}

export interface PrepTimeAccuracy {
  /** Minutes the cafe promised, averaged over accepted orders. */
  averagePromisedMinutes: number;
  /** Minutes it actually took from acceptance to READY. */
  averageActualMinutes: number;
  /** Share of orders that hit the promised time. */
  onTimePercent: number;
  sampleSize: number;
}

/**
 * How honest the promised ready times were. Only orders that were both
 * accepted and marked ready can answer this, so cancellations and orders
 * still in the kitchen are excluded rather than counted as zero.
 */
export async function getPrepTimeAccuracy(
  range: ReportScope,
): Promise<PrepTimeAccuracy> {
  await ready();
  requirePermission("REPORTS");

  let promised = 0;
  let actual = 0;
  let onTime = 0;
  let sample = 0;

  for (const order of salesOrders(range)) {
    const acceptedAt = order.statusHistory.find((e) => e.status === "ACCEPTED")?.at;
    const readyAt = order.statusHistory.find((e) => e.status === "READY")?.at;
    if (!acceptedAt || !readyAt || !order.estimatedReadyAt) continue;

    // History timestamps are epoch ms; estimatedReadyAt is still ISO.
    const promisedAt = Date.parse(order.estimatedReadyAt);
    promised += (promisedAt - acceptedAt) / 60000;
    actual += (readyAt - acceptedAt) / 60000;
    if (readyAt <= promisedAt) onTime += 1;
    sample += 1;
  }

  if (sample === 0) {
    return {
      averagePromisedMinutes: 0,
      averageActualMinutes: 0,
      onTimePercent: 0,
      sampleSize: 0,
    };
  }
  return {
    averagePromisedMinutes: Math.round(promised / sample),
    averageActualMinutes: Math.round(actual / sample),
    onTimePercent: Math.round((onTime / sample) * 100),
    sampleSize: sample,
  };
}

/** KPI block on the admin dashboard. */
export async function getDashboardKpis(
  outletId?: OutletId,
  now = new Date(),
): Promise<{
  todayRevenue: number;
  todayOrders: number;
  averageOrderValue: number;
  activeOrders: number;
  totalCustomers: number;
  /** Online payments the admin still has to confirm. */
  awaitingVerification: number;
  /** Dine-in cash not yet collected. */
  cashPending: number;
  /** Scheduled orders due later today. */
  scheduledToday: number;
  /** Past their promised ready time and not ready yet. */
  overdue: number;
  /** Table bookings still waiting for the cafe to confirm. */
  pendingBookings: number;
  /** Enquiries nobody has picked up yet. */
  newEnquiries: number;
}> {
  await ready();
  requirePermission("REPORTS");

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const endOfDay = new Date(start);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const scope = adminReadScope(outletId);
  const today = salesOrders({ from: start, to: now, outletId: scope });
  const summary = summarise(today);
  const all = readCollection<Order>("orders").filter(
    (o) => !scope || o.outletId === scope,
  );

  let awaitingVerification = 0;
  let cashPending = 0;
  let scheduledToday = 0;
  let overdue = 0;

  for (const order of all) {
    const flags = flagsFor(order, now);
    if (flags.awaitingVerification) awaitingVerification += 1;
    if (flags.cashPending) cashPending += 1;
    if (flags.isOverdue) overdue += 1;
    if (
      order.isScheduled &&
      order.scheduledFor &&
      order.status !== "CANCELLED" &&
      order.status !== "HANDED_OVER" &&
      Date.parse(order.scheduledFor) >= start.getTime() &&
      Date.parse(order.scheduledFor) < endOfDay.getTime()
    ) {
      scheduledToday += 1;
    }
  }

  return {
    todayRevenue: today.reduce((sum, o) => sum + o.total, 0),
    todayOrders: summary.orderCount,
    averageOrderValue: summary.averageOrderValue,
    activeOrders: all.filter(
      (o) => o.status !== "HANDED_OVER" && o.status !== "CANCELLED",
    ).length,
    totalCustomers: readCollection<User>("users").filter((u) => u.role === "CUSTOMER")
      .length,
    awaitingVerification,
    cashPending,
    scheduledToday,
    overdue,
    pendingBookings: readCollection<TableBooking>("bookings").filter(
      (b) => b.status === "PENDING" && (!scope || b.outletId === scope),
    ).length,
    newEnquiries: readCollection<Enquiry>("enquiries").filter(
      (e) => e.status === "NEW" && (!scope || e.outletId === scope),
    ).length,
  };
}

/**
 * Activity feed for the dashboard — what the team did today.
 *
 * The full audit log is the super admin's (see services/staff.ts); this is the
 * same rows trimmed to a glance, available to anyone who can read reports.
 */
export async function getRecentActivity(limit = 8): Promise<ActivityLogEntry[]> {
  await ready();
  requirePermission("REPORTS");
  return readCollection<ActivityLogEntry>("activityLog").slice(0, limit);
}

/** Generic CSV builder used by every "Export CSV" button. */
export function toCsv(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(",")),
  ].join("\n");
}
