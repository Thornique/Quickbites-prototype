import { computeTotals, couponDiscountFor, priceLine } from "@/lib/pricing";
import type {
  CartLine,
  Coupon,
  MenuItem,
  Order,
  OrderLine,
  OrderStatus,
  OrderStatusEvent,
  PaymentMethod,
  PaymentStatus,
  SelectedOption,
  User,
} from "@/types";
import { createRandom, type Random } from "./random";

const TAX_RATE = 5;
const PACKAGING = 10;
const ADMIN = { id: "user-manager", name: "Sunita Deshmukh" };

/** How many of the generated orders belong to today. */
const TODAY_COUNT = 16;
/** Of those, how many are still open on the kitchen board. */
const LIVE_COUNT = 6;

/**
 * Orders per hour of the day, indexed 0–23. Khandwa trade is bimodal: a lunch
 * rush at 1–3pm and a heavier evening peak at 6–10pm. Zeroes outside the
 * 10:00–23:00 opening hours.
 */
const HOUR_WEIGHTS = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 00:00–09:00 closed
  2,
  3,
  6,
  12,
  11,
  7,
  4,
  5,
  9,
  13,
  14,
  10,
  5, // 10:00–22:00
  0, // 23:00 — kitchen closes
];

const PICKUP_NOTES = [
  undefined,
  undefined,
  undefined,
  "Less spicy please",
  "No onion",
  "Extra tissue and spoons",
  "Pack separately",
  "Call when ready",
];

const CANCEL_REASONS = [
  "Customer did not collect",
  "Item unavailable",
  "Customer requested cancellation",
  "Duplicate order",
];

/** Picks 1–4 items, favouring popular ones. */
function pickLines(random: Random, menu: MenuItem[]): CartLine[] {
  const weights = menu.map((item) => item.popularity);
  const count = random.weighted([38, 34, 18, 10]) + 1;
  const chosen = new Map<string, MenuItem>();

  while (chosen.size < count) {
    const item = menu[random.weighted(weights)];
    if (!chosen.has(item.id)) chosen.set(item.id, item);
  }

  return [...chosen.values()].map((item) => {
    const selectedOptions: SelectedOption[] = [];

    for (const group of item.optionGroups) {
      if (group.type === "single") {
        // Required groups always get a choice; optional ones usually default.
        if (!group.isRequired && random.chance(0.75)) continue;
        const option = random.pick(group.options);
        selectedOptions.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          priceDelta: option.priceDelta,
        });
      } else if (random.chance(0.35)) {
        for (const option of random.sample(group.options, random.int(1, 2))) {
          selectedOptions.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            priceDelta: option.priceDelta,
          });
        }
      }
    }

    const optionIds = selectedOptions
      .map((o) => o.optionId)
      .sort()
      .join(",");

    return {
      lineKey: `${item.id}|${optionIds}|`,
      menuItemId: item.id,
      slug: item.slug,
      name: item.name,
      image: item.images[0] ?? "",
      isVeg: item.isVeg,
      unitPrice: item.price,
      selectedOptions,
      quantity: random.weighted([70, 22, 8]) + 1,
      prepMinutes: item.prepMinutes,
    } satisfies CartLine;
  });
}

/** Status trail for a finished order, with plausible gaps between steps. */
function completedHistory(
  random: Random,
  placedAt: Date,
  finalStatus: OrderStatus,
): { history: OrderStatusEvent[]; readyAt: Date } {
  const history: OrderStatusEvent[] = [
    { status: "PLACED", at: placedAt.toISOString() },
  ];
  let cursor = placedAt.getTime();
  const step = (minutes: number) => {
    cursor += minutes * 60_000;
    return new Date(cursor).toISOString();
  };

  if (finalStatus === "CANCELLED") {
    history.push({
      status: "CANCELLED",
      at: step(random.int(2, 25)),
      byUserId: ADMIN.id,
      byName: ADMIN.name,
      reason: random.pick(CANCEL_REASONS),
    });
    return { history, readyAt: new Date(cursor) };
  }

  const by = { byUserId: ADMIN.id, byName: ADMIN.name };
  history.push({ status: "ACCEPTED", at: step(random.int(1, 4)), ...by });
  history.push({ status: "PREPARING", at: step(random.int(1, 3)), ...by });
  const readyIso = step(random.int(5, 14));
  history.push({ status: "READY", at: readyIso, ...by });
  history.push({ status: "PICKED_UP", at: step(random.int(2, 18)), ...by });

  return { history, readyAt: new Date(readyIso) };
}

/** Trail for an order still open on the board, stopping at `status`. */
function liveHistory(
  random: Random,
  placedAt: Date,
  status: OrderStatus,
): OrderStatusEvent[] {
  const sequence: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY"];
  const upto = sequence.indexOf(status);
  const history: OrderStatusEvent[] = [
    { status: "PLACED", at: placedAt.toISOString() },
  ];
  let cursor = placedAt.getTime();

  for (let i = 1; i <= upto; i += 1) {
    cursor += random.int(1, 4) * 60_000;
    history.push({
      status: sequence[i],
      at: new Date(cursor).toISOString(),
      byUserId: ADMIN.id,
      byName: ADMIN.name,
    });
  }
  return history;
}

export interface BuildOrdersInput {
  menu: MenuItem[];
  customers: User[];
  coupons: Coupon[];
  /** "Now" for the generated history — the demo day. */
  now: Date;
  count?: number;
}

export function buildSeedOrders({
  menu,
  customers,
  coupons,
  now,
  count = 500,
}: BuildOrdersInput): Order[] {
  const random = createRandom(90210);
  const sellable = menu.filter((item) => item.isAvailable);
  const pool = customers.filter((c) => c.role === "CUSTOMER");
  const demo = customers.find((c) => c.id === "user-demo");
  const activeCoupons = coupons.filter(
    (c) => c.isActive && Date.parse(c.validTo) > now.getTime(),
  );

  let index = 0;

  function makeOrder(placedAt: Date, status: OrderStatus): Order {
    index += 1;
    // Give the demo account roughly every twelfth order so their history fills.
    const customer = demo && index % 12 === 0 ? demo : random.pick(pool);

    const pricedLines = pickLines(random, sellable).map(priceLine);
    const subtotal = pricedLines.reduce((sum, l) => sum + l.lineTotal, 0);

    // ~30% of orders used a coupon, and only when the minimum is actually met.
    let discount = 0;
    let couponCode: string | undefined;
    if (activeCoupons.length > 0 && random.chance(0.3)) {
      const coupon = random.pick(activeCoupons);
      if (subtotal >= coupon.minOrder) {
        discount = couponDiscountFor(coupon, subtotal);
        couponCode = coupon.code;
      }
    }

    const totals = computeTotals({
      lines: pricedLines,
      discount,
      packagingCharge: PACKAGING,
      taxRate: TAX_RATE,
      appliedCouponCode: couponCode,
    });

    const isLive = status !== "PICKED_UP" && status !== "CANCELLED";
    const { history, readyAt } = isLive
      ? {
          history: liveHistory(random, placedAt, status),
          readyAt: new Date(placedAt.getTime() + random.int(12, 25) * 60_000),
        }
      : completedHistory(random, placedAt, status);

    const paymentMethod = random.pick<PaymentMethod>([
      "UPI",
      "UPI",
      "UPI",
      "UPI",
      "UPI",
      "UPI",
      "CARD",
      "CARD",
      "COUNTER",
      "COUNTER",
    ]);
    const paymentStatus: PaymentStatus =
      paymentMethod === "COUNTER"
        ? status === "PICKED_UP"
          ? "PAID"
          : "PAY_AT_COUNTER"
        : status === "CANCELLED"
          ? "REFUNDED"
          : "PAID";

    return {
      // Replaced with a chronological number once everything is sorted.
      id: `tmp-${index}`,
      customerId: customer.id,
      lines: pricedLines as OrderLine[],
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      discount: totals.discount,
      couponCode,
      packagingCharge: totals.packagingCharge,
      taxRate: totals.taxRate,
      tax: totals.tax,
      total: totals.total,
      paymentMethod,
      paymentStatus,
      status,
      statusHistory: history,
      estimatedReadyAt: readyAt.toISOString(),
      pickupName: customer.name,
      phone: customer.phone,
      notes: random.pick(PICKUP_NOTES),
      // Anything past PLACED has already consumed its ingredients.
      stockDeducted: status !== "PLACED" && status !== "CANCELLED",
      createdAt: placedAt.toISOString(),
    };
  }

  const orders: Order[] = [];

  // ---- Days 1–59 ago: everything is finished -----------------------------
  const historyCount = Math.max(0, count - TODAY_COUNT);
  for (let i = 0; i < historyCount; i += 1) {
    const placedAt = new Date(now);
    placedAt.setDate(placedAt.getDate() - random.int(1, 59));
    placedAt.setHours(
      random.weighted(HOUR_WEIGHTS),
      random.int(0, 59),
      random.int(0, 59),
      0,
    );
    orders.push(makeOrder(placedAt, random.chance(0.07) ? "CANCELLED" : "PICKED_UP"));
  }

  /*
    Today needs care. Picking a random peak hour and discarding anything in the
    future leaves the kitchen board empty whenever the demo runs before lunch,
    so today's orders are placed in the time that has ALREADY passed, and the
    most recent few are left open across the board's four columns.
  */
  const completedToday = TODAY_COUNT - LIVE_COUNT;
  for (let i = 0; i < completedToday; i += 1) {
    // Somewhere between opening and 40 minutes ago.
    const placedAt = new Date(now.getTime() - random.int(40, 10 * 60) * 60_000);
    if (placedAt.getDate() !== now.getDate()) continue;
    orders.push(makeOrder(placedAt, random.chance(0.06) ? "CANCELLED" : "PICKED_UP"));
  }

  // The live board: one order per column, plus a couple of extras waiting.
  const liveStatuses: OrderStatus[] = [
    "PLACED",
    "PLACED",
    "ACCEPTED",
    "PREPARING",
    "PREPARING",
    "READY",
  ];
  liveStatuses.slice(0, LIVE_COUNT).forEach((status, i) => {
    // Newest first: a PLACED order is ~2 minutes old, a READY one ~25.
    const minutesAgo = 2 + i * 4 + (i === LIVE_COUNT - 1 ? 8 : 0);
    orders.push(makeOrder(new Date(now.getTime() - minutesAgo * 60_000), status));
  });

  // Oldest first, so the order numbers read chronologically.
  orders.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  return orders.map((order, i) => ({ ...order, id: `QB-${1001 + i}` }));
}
