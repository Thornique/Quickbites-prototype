import { toDateKey } from "@/lib/format";
import { computeTotals, couponDiscountFor, priceLine } from "@/lib/pricing";
import { formatToken, toOrderLines } from "@/services/order-rules";
import type {
  Coupon,
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  OutletId,
  PaymentEvent,
  PaymentMethod,
  PaymentStatus,
  User,
} from "@/types";
import { pickLines } from "./order-lines";
import { createRandom, type Random } from "./random";

const TAX_RATE = 5;
const ADMIN_BY_OUTLET: Record<OutletId, string> = {
  restaurant: "user-manager",
  coffee: "user-coffee",
};

/** Matches the packaging charge in each outlet's seeded settings. */
const PACKAGING: Record<OutletId, number> = { restaurant: 10, coffee: 5 };

/** History window. 45 days still gives the reports a full picture of trade. */
const HISTORY_DAYS = 45;
/** How many of the generated orders belong to today. */
const TODAY_COMPLETED: Record<OutletId, number> = { restaurant: 12, coffee: 8 };

/**
 * Orders per hour of the day, indexed 0-23.
 *
 * The two outlets trade at different times, and a report that cannot show
 * that is not worth running: the kitchen is bimodal (lunch at 1-3, a heavier
 * evening peak at 6-10), while the coffee counter peaks before work and
 * again mid-afternoon, and is shut by the time the restaurant is busiest.
 */
const HOUR_WEIGHTS: Record<OutletId, number[]> = {
  restaurant: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 6, 12, 11, 7, 4, 5, 9, 13, 14, 10, 5, 0,
  ],
  coffee: [0, 0, 0, 0, 0, 0, 0, 6, 14, 15, 10, 7, 6, 8, 7, 9, 12, 11, 8, 6, 4, 3, 1, 0],
};

const NOTES: Record<OutletId, Array<string | undefined>> = {
  restaurant: [
    undefined,
    undefined,
    undefined,
    "Less spicy please",
    "No onion",
    "Extra tissue and spoons",
    "Pack separately",
    "Call when ready",
  ],
  coffee: [
    undefined,
    undefined,
    undefined,
    "Extra hot please",
    "No cocoa dust on top",
    "Warm the brownie",
    "Separate lid, drinking in",
    "Call when ready",
  ],
};

const CANCEL_REASONS = [
  "Customer did not collect",
  "Item unavailable",
  "Customer requested cancellation",
  "Duplicate order",
];

function ref(random: Random): string {
  let out = "";
  for (let i = 0; i < 12; i += 1) out += random.int(0, 9);
  return out;
}

export interface BuildOrdersInput {
  menu: MenuItem[];
  customers: User[];
  coupons: Coupon[];
  now: Date;
  /** Orders per outlet. Trimmed to keep the whole seed inside the budget. */
  counts?: Record<OutletId, number>;
}

/**
 * Builds the order history for both outlets.
 *
 * Order numbers stay one shared QB- series, because /order/QB-1234 has to
 * resolve without knowing which counter took it. Counter tokens do not: they
 * are called out loud at one till, so they are counted per outlet and per day
 * — A-series at the restaurant, C-series at the coffee shop.
 */
export function buildSeedOrders({
  menu,
  customers,
  coupons,
  now,
  counts = { restaurant: 280, coffee: 150 },
}: BuildOrdersInput): Order[] {
  const random = createRandom(90210);
  const pool = customers.filter((c) => c.role === "CUSTOMER");
  const demo = customers.find((c) => c.id === "user-demo");

  let index = 0;
  const tokensByDay = new Map<string, number>();

  function tokenFor(outletId: OutletId, at: Date): string {
    const key = `${outletId}:${toDateKey(at)}`;
    const next = (tokensByDay.get(key) ?? 0) + 1;
    tokensByDay.set(key, next);
    return formatToken(next, outletId);
  }

  function makeBase(outletId: OutletId) {
    const sellable = menu.filter(
      (item) => item.outletId === outletId && item.isAvailable,
    );
    const activeCoupons = coupons.filter(
      (c) =>
        c.outletId === outletId && c.isActive && Date.parse(c.validTo) > now.getTime(),
    );

    /** Base order with money worked out; status and payment applied by callers. */
    return function base(placedAt: Date, orderType: OrderType): Order {
      index += 1;
      const customer = demo && index % 12 === 0 ? demo : random.pick(pool);
      const pricedLines = pickLines(random, sellable).map(priceLine);
      const subtotal = pricedLines.reduce((sum, l) => sum + l.lineTotal, 0);

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
        packagingCharge: PACKAGING[outletId],
        taxRate: TAX_RATE,
        appliedCouponCode: couponCode,
        orderType,
      });

      return {
        id: `tmp-${index}`,
        tokenNumber: tokenFor(outletId, placedAt),
        outletId,
        customerId: customer.id,
        orderType,
        tableNumber:
          orderType === "DINE_IN" && random.chance(0.8)
            ? String(random.int(1, 12))
            : undefined,
        lines: toOrderLines(pricedLines),
        itemCount: totals.itemCount,
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode,
        packagingCharge: totals.packagingCharge,
        taxRate: totals.taxRate,
        tax: totals.tax,
        total: totals.total,
        paymentMethod: "ONLINE_UPI",
        paymentStatus: "UNPAID",
        paymentHistory: [],
        status: "PLACED",
        statusHistory: [{ status: "PLACED", at: placedAt.getTime() }],
        readyTimeHistory: [],
        isScheduled: false,
        pickupName: customer.name,
        phone: customer.phone,
        notes: random.pick(NOTES[outletId]),
        stockDeducted: false,
        createdAt: placedAt.toISOString(),
      };
    };
  }

  /**
   * A finished order.
   *
   * Historical orders keep a single collapsed payment event and one ready-time
   * entry rather than the full blow-by-blow: the audit trail earns its storage
   * on live orders, not on the four hundred that are already closed.
   */
  function makeCompleted(outletId: OutletId, base: ReturnType<typeof makeBase>) {
    const adminId = ADMIN_BY_OUTLET[outletId];

    return function completed(placedAt: Date, orderType: OrderType): Order {
      const order = base(placedAt, orderType);
      const method: PaymentMethod =
        orderType === "TAKEAWAY"
          ? random.pick<PaymentMethod>(["ONLINE_UPI", "ONLINE_UPI", "ONLINE_CARD"])
          : random.pick<PaymentMethod>(["ONLINE_UPI", "CASH", "CASH"]);
      const isCash = method === "CASH";
      const paymentRef = isCash ? undefined : ref(random);

      let cursor = placedAt.getTime();
      const step = (minutes: number) => {
        cursor += minutes * 60_000;
        return cursor;
      };

      const history: Order["statusHistory"] = [
        { status: "PLACED", at: placedAt.getTime() },
      ];

      // ~7% of past orders were cancelled before the kitchen started.
      if (random.chance(0.07)) {
        const cancelAt = step(random.int(2, 25));
        history.push({
          status: "CANCELLED",
          at: cancelAt,
          byUserId: adminId,
          reason: random.pick(CANCEL_REASONS),
        });
        const refundEvent: PaymentEvent[] = isCash
          ? []
          : [
              {
                action: "REFUNDED",
                method,
                amount: order.total,
                ref: paymentRef,
                byUserId: adminId,
                at: cancelAt,
              },
            ];
        return {
          ...order,
          paymentMethod: method,
          paymentStatus: isCash ? "UNPAID" : "REFUNDED",
          paymentRef,
          paymentHistory: refundEvent,
          status: "CANCELLED",
          statusHistory: history,
        };
      }

      const verifiedAt = step(random.int(1, 3));
      // A coffee is promised in minutes, not the quarter-hour a pizza takes.
      const promised =
        outletId === "coffee"
          ? random.pick([5, 6, 8, 8, 10, 10, 12])
          : random.pick([10, 15, 15, 20, 20, 25, 30]);
      const acceptedAt = step(random.int(1, 2));
      history.push({ status: "ACCEPTED", at: acceptedAt, byUserId: adminId });
      const estimatedReadyAt = new Date(acceptedAt + promised * 60_000).toISOString();

      history.push({
        status: "PREPARING",
        at: step(random.int(1, 3)),
        byUserId: adminId,
      });

      // The counter beats the promise about 85% of the time.
      const onTime = random.chance(0.85);
      const slack = outletId === "coffee" ? 3 : 7;
      const actual = onTime
        ? random.int(Math.max(2, promised - slack), Math.max(2, promised - 1))
        : promised + random.int(2, 12);
      cursor = acceptedAt + actual * 60_000;
      history.push({ status: "READY", at: cursor, byUserId: adminId });
      history.push({
        status: "HANDED_OVER",
        at: step(random.int(2, 15)),
        byUserId: adminId,
      });

      const cashReceived = isCash ? Math.ceil(order.total / 50) * 50 : undefined;

      return {
        ...order,
        paymentMethod: method,
        paymentStatus: "VERIFIED" as PaymentStatus,
        paymentRef,
        paymentHistory: [
          {
            action: isCash ? "CASH_RECEIVED" : "PAYMENT_VERIFIED",
            method,
            amount: isCash ? (cashReceived ?? order.total) : order.total,
            ref: paymentRef,
            byUserId: adminId,
            at: verifiedAt,
          },
        ],
        cashReceived,
        changeReturned: cashReceived ? cashReceived - order.total : undefined,
        status: "HANDED_OVER",
        statusHistory: history,
        estimatedReadyAt,
        readyTimeSetBy: adminId,
        readyTimeHistory: [{ minutes: promised, at: acceptedAt, byUserId: adminId }],
        stockDeducted: true,
      };
    };
  }

  const orders: Order[] = [];

  for (const outletId of ["restaurant", "coffee"] as const) {
    const base = makeBase(outletId);
    const completed = makeCompleted(outletId, base);
    // Coffee goes out of the door in a cup far more often than it is sat with.
    const takeawayShare = outletId === "coffee" ? 0.75 : 0.65;
    const typeFor = () =>
      random.chance(takeawayShare) ? ("TAKEAWAY" as const) : ("DINE_IN" as const);

    const todayCount = TODAY_COMPLETED[outletId];
    const historyCount = Math.max(0, counts[outletId] - todayCount - 12);

    // ---- Earlier days: everything is finished ---------------------------
    for (let i = 0; i < historyCount; i += 1) {
      const placedAt = new Date(now);
      placedAt.setDate(placedAt.getDate() - random.int(1, HISTORY_DAYS));
      placedAt.setHours(
        random.weighted(HOUR_WEIGHTS[outletId]),
        random.int(0, 59),
        random.int(0, 59),
        0,
      );
      orders.push(completed(placedAt, typeFor()));
    }

    // ---- Earlier today, already finished --------------------------------
    for (let i = 0; i < todayCount; i += 1) {
      const placedAt = new Date(now.getTime() - random.int(60, 9 * 60) * 60_000);
      if (placedAt.getDate() !== now.getDate()) continue;
      orders.push(completed(placedAt, typeFor()));
    }

    orders.push(...buildOpenOrders({ outletId, random, now, base }));
  }

  orders.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  return orders.map((order, i) => ({ ...order, id: `QB-${1001 + i}` }));
}

/**
 * The live board, built for each outlet.
 *
 * Every state the admin UI has to handle is represented, so the panel can be
 * demoed without anyone staging data by hand — and the coffee board carries
 * its own set, so a coffee admin signing in does not find an empty screen.
 */
function buildOpenOrders({
  outletId,
  random,
  now,
  base,
}: {
  outletId: OutletId;
  random: Random;
  now: Date;
  base: (placedAt: Date, orderType: OrderType) => Order;
}): Order[] {
  const adminId = ADMIN_BY_OUTLET[outletId];
  const agoMs = (m: number) => now.getTime() - m * 60_000;
  const agoDate = (m: number) => new Date(agoMs(m));
  const out: Order[] = [];

  const paid = (order: Order, method: PaymentMethod, at: number): Order => ({
    ...order,
    paymentMethod: method,
    paymentStatus: "PAID_UNVERIFIED",
    paymentRef: ref(random),
    paymentHistory: [
      { action: "ONLINE_PAID", method, amount: order.total, ref: ref(random), at },
    ],
  });

  const verify = (order: Order, at: number): Order => ({
    ...order,
    paymentStatus: "VERIFIED",
    paymentHistory: [
      ...order.paymentHistory,
      {
        action: "PAYMENT_VERIFIED",
        method: order.paymentMethod,
        amount: order.total,
        ref: order.paymentRef,
        byUserId: adminId,
        at,
      },
    ],
  });

  const acceptAt = (order: Order, at: number, promised: number): Order => ({
    ...order,
    statusHistory: [
      ...order.statusHistory,
      { status: "ACCEPTED", at, byUserId: adminId },
    ],
    status: "ACCEPTED",
    estimatedReadyAt: new Date(at + promised * 60_000).toISOString(),
    readyTimeSetBy: adminId,
    readyTimeHistory: [{ minutes: promised, at, byUserId: adminId }],
    stockDeducted: true,
  });

  const advance = (order: Order, status: OrderStatus, at: number): Order => ({
    ...order,
    status,
    statusHistory: [...order.statusHistory, { status, at, byUserId: adminId }],
  });

  // 1. Takeaway awaiting payment verification.
  out.push(paid(base(agoDate(4), "TAKEAWAY"), "ONLINE_UPI", agoMs(4)));

  // 2. Takeaway whose payment was rejected — customer must pay again.
  const rejected = paid(base(agoDate(9), "TAKEAWAY"), "ONLINE_CARD", agoMs(9));
  out.push({
    ...rejected,
    paymentStatus: "FAILED",
    paymentHistory: [
      ...rejected.paymentHistory,
      {
        action: "PAYMENT_REJECTED",
        method: rejected.paymentMethod,
        amount: rejected.total,
        ref: rejected.paymentRef,
        reason: "No matching transaction in the UPI statement.",
        byUserId: adminId,
        at: agoMs(6),
      },
    ],
  });

  // 3. Dine-in cash, unpaid, already being prepared.
  const cashOrder = base(agoDate(12), "DINE_IN");
  out.push(
    advance(
      acceptAt({ ...cashOrder, paymentMethod: "CASH" }, agoMs(10), 20),
      "PREPARING",
      agoMs(8),
    ),
  );

  // 4. READY but blocked from handover — the money is not confirmed.
  const blocked = base(agoDate(26), "DINE_IN");
  out.push(
    advance(
      advance(
        acceptAt({ ...blocked, paymentMethod: "CASH" }, agoMs(24), 20),
        "PREPARING",
        agoMs(22),
      ),
      "READY",
      agoMs(3),
    ),
  );

  // 5. Overdue: promised 15 minutes, 28 minutes ago, still preparing.
  const overdue = verify(
    paid(base(agoDate(32), "TAKEAWAY"), "ONLINE_UPI", agoMs(32)),
    agoMs(30),
  );
  out.push(advance(acceptAt(overdue, agoMs(28), 15), "PREPARING", agoMs(26)));

  /*
    6. A takeaway paid 9 minutes ago that nobody has verified yet. Scenario 1
       is only 4 minutes old, so it is pending but not yet late; this one is
       past verificationAlertMinutes and so drives the STALE_PENDING flag and
       its alert.
  */
  out.push(paid(base(agoDate(9), "TAKEAWAY"), "ONLINE_UPI", agoMs(9)));

  // 7. A verified takeaway waiting to be accepted — the clean happy path.
  out.push(
    verify(paid(base(agoDate(2), "TAKEAWAY"), "ONLINE_UPI", agoMs(2)), agoMs(1)),
  );

  // ---- Scheduled: later today and tomorrow -----------------------------
  const slotAt = (dayOffset: number, hour: number, minute: number) => {
    const at = new Date(now);
    at.setDate(at.getDate() + dayOffset);
    at.setHours(hour, minute, 0, 0);
    return at;
  };

  /*
    Slots have to land inside each outlet's own hours, or the order would show
    as scheduled for a time the shop is shut. The coffee shop closes at 22:30
    and opens at 07:30, so its slots are clamped tighter and its "tomorrow"
    pair is a breakfast and a mid-morning one.
  */
  const closeHour = outletId === "coffee" ? 21 : 22;
  const scheduledSlots: Array<[number, number, number]> =
    outletId === "coffee"
      ? [
          [0, Math.min(closeHour, Math.max(8, now.getHours() + 2)), 30],
          [0, Math.min(closeHour, Math.max(9, now.getHours() + 4)), 0],
          [1, 8, 30],
          [1, 11, 0],
        ]
      : [
          [0, Math.min(21, now.getHours() + 3), 30],
          [0, Math.min(closeHour, now.getHours() + 4), 0],
          [0, Math.min(closeHour, now.getHours() + 5), 15],
          [1, 13, 0],
          [1, 19, 30],
        ];

  for (const [dayOffset, hour, minute] of scheduledSlots) {
    const slot = slotAt(dayOffset, hour, minute);
    const placedAt = agoDate(random.int(20, 120));
    const order = verify(
      paid(base(placedAt, "TAKEAWAY"), "ONLINE_UPI", placedAt.getTime()),
      agoMs(random.int(5, 15)),
    );
    out.push({
      ...order,
      isScheduled: true,
      scheduledFor: slot.toISOString(),
      // A scheduled order's promise is the slot, not a countdown from accept.
      estimatedReadyAt: slot.toISOString(),
    });
  }

  return out;
}
