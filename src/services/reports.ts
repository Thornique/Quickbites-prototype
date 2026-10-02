import { toDateKey } from "@/lib/format";
import { readCollection } from "@/storage";
import type { Coupon, MenuItem, Order, PaymentMethod, User } from "@/types";
import { ready, requirePermission } from "./common";

export interface DateRange {
  from: Date;
  to: Date;
}

/** Orders that actually earned money — cancellations never count as sales. */
function salesOrders(range: DateRange): Order[] {
  const from = range.from.getTime();
  const to = range.to.getTime();
  return readCollection<Order>("orders").filter((order) => {
    if (order.status === "CANCELLED") return false;
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

export async function getSalesSummary(range: DateRange): Promise<ComparedSummary> {
  await ready();
  requirePermission("REPORTS");

  const current = summarise(salesOrders(range));
  const span = range.to.getTime() - range.from.getTime();
  const previous = summarise(
    salesOrders({
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

/** Net sales per day, for the 30-day revenue line chart. */
export async function getRevenueByDay(
  range: DateRange,
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
export async function getOrdersByHour(range: DateRange): Promise<number[]> {
  await ready();
  requirePermission("REPORTS");

  const hours = new Array<number>(24).fill(0);
  for (const order of salesOrders(range)) {
    hours[new Date(order.createdAt).getHours()] += 1;
  }
  return hours;
}

/** Day × hour grid for the sales heatmap. Index [weekday][hour]. */
export async function getSalesHeatmap(range: DateRange): Promise<number[][]> {
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

export async function getItemPerformance(range: DateRange): Promise<ItemPerformance[]> {
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
  range: DateRange,
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
  range: DateRange,
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
  range: DateRange,
): Promise<
  Array<{ code: string; uses: number; discountGiven: number; revenue: number }>
> {
  await ready();
  requirePermission("REPORTS");

  const coupons = readCollection<Coupon>("coupons");
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
export async function getCustomerMix(range: DateRange): Promise<{
  newCustomers: number;
  returningCustomers: number;
}> {
  await ready();
  requirePermission("REPORTS");

  const all = readCollection<Order>("orders").filter((o) => o.status !== "CANCELLED");
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

/** KPI block on the admin dashboard. */
export async function getDashboardKpis(now = new Date()): Promise<{
  todayRevenue: number;
  todayOrders: number;
  averageOrderValue: number;
  activeOrders: number;
  totalCustomers: number;
}> {
  await ready();
  requirePermission("REPORTS");

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const today = salesOrders({ from: start, to: now });
  const summary = summarise(today);

  const activeOrders = readCollection<Order>("orders").filter(
    (o) => o.status !== "PICKED_UP" && o.status !== "CANCELLED",
  ).length;

  return {
    todayRevenue: today.reduce((sum, o) => sum + o.total, 0),
    todayOrders: summary.orderCount,
    averageOrderValue: summary.averageOrderValue,
    activeOrders,
    totalCustomers: readCollection<User>("users").filter((u) => u.role === "CUSTOMER")
      .length,
  };
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
