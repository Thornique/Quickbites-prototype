import { notFound } from "@/lib/errors";
import { readCollection, writeCollection } from "@/storage";
import type { Order, User } from "@/types";
import { logActivity, nowIso, ready, requirePermission } from "./common";

/** A customer row enriched with the order stats the admin table shows. */
export interface CustomerSummary {
  user: User;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string;
  favouriteItem?: string;
}

function summarise(user: User, orders: Order[]): CustomerSummary {
  // Cancelled orders are excluded from spend — no money changed hands.
  const theirs = orders.filter(
    (o) => o.customerId === user.id && o.status !== "CANCELLED",
  );

  const itemCounts = new Map<string, number>();
  for (const order of theirs) {
    for (const line of order.lines) {
      itemCounts.set(line.name.en, (itemCounts.get(line.name.en) ?? 0) + line.quantity);
    }
  }
  const favourite = [...itemCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    user,
    orderCount: theirs.length,
    totalSpent: theirs.reduce((sum, o) => sum + o.total, 0),
    lastOrderAt: theirs
      .map((o) => o.createdAt)
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0],
    favouriteItem: favourite?.[0],
  };
}

export async function listCustomers(search?: string): Promise<CustomerSummary[]> {
  await ready();
  const orders = readCollection<Order>("orders");
  const term = search?.trim().toLowerCase();

  return readCollection<User>("users")
    .filter((u) => u.role === "CUSTOMER")
    .filter((u) =>
      term ? [u.name, u.email, u.phone].join(" ").toLowerCase().includes(term) : true,
    )
    .map((u) => summarise(u, orders))
    .sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function getCustomer(id: string): Promise<CustomerSummary> {
  await ready();
  const user = readCollection<User>("users").find((u) => u.id === id);
  if (!user) throw notFound("Customer");
  return summarise(user, readCollection<Order>("orders"));
}

export async function setCustomerBlocked(id: string, blocked: boolean): Promise<User> {
  await ready();
  const admin = requirePermission("CUSTOMERS");
  const users = readCollection<User>("users");
  const existing = users.find((u) => u.id === id);
  if (!existing) throw notFound("Customer");

  const next: User = {
    ...existing,
    status: blocked ? "BLOCKED" : "ACTIVE",
    updatedAt: nowIso(),
  };
  writeCollection(
    "users",
    users.map((u) => (u.id === id ? next : u)),
    "update",
    id,
  );
  logActivity(
    admin,
    blocked ? "CUSTOMER_BLOCKED" : "CUSTOMER_UNBLOCKED",
    `${blocked ? "Blocked" : "Unblocked"} customer ${existing.name}`,
    id,
  );
  return next;
}

/** Free-text admin note on the customer detail screen. */
export async function setCustomerNotes(id: string, notes: string): Promise<User> {
  await ready();
  requirePermission("CUSTOMERS");
  const users = readCollection<User>("users");
  const existing = users.find((u) => u.id === id);
  if (!existing) throw notFound("Customer");

  const next: User = {
    ...existing,
    notes: notes.trim() || undefined,
    updatedAt: nowIso(),
  };
  writeCollection(
    "users",
    users.map((u) => (u.id === id ? next : u)),
    "update",
    id,
  );
  return next;
}
