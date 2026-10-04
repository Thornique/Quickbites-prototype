import { invalid } from "@/lib/errors";
import { cartLineKey, computeTotals, priceLine } from "@/lib/pricing";
import { estimateReadyAtForLines } from "@/lib/prep-time";
import { readCollection } from "@/storage";
import type {
  CartLine,
  Coupon,
  OrderType,
  MenuItem,
  Order,
  OutletId,
  PricedCart,
  SelectedOption,
} from "@/types";
import { evaluateCoupon } from "./coupons";
import { getCurrentUser, ready, settingsFor } from "./common";

/**
 * All cart money and timing lives here. Components never add up prices
 * themselves — they render what this returns.
 *
 * Every entry point takes the outlet: tax, packaging and the prep buffer are
 * the outlet's own settings, and the queue a coffee waits behind is the coffee
 * counter's queue, not the kitchen's.
 */

/** Builds a cart line from an item plus the customer's option choices. */
export function buildCartLine(
  item: MenuItem,
  optionIds: string[],
  quantity: number,
  notes?: string,
): CartLine {
  const selectedOptions: SelectedOption[] = [];

  for (const group of item.optionGroups) {
    const chosen = group.options.filter((option) => optionIds.includes(option.id));

    if (group.isRequired && chosen.length < Math.max(1, group.minSelect)) {
      throw invalid(`Please choose a ${group.name.en.toLowerCase()}.`, group.id);
    }
    if (group.type === "single" && chosen.length > 1) {
      throw invalid(`Only one ${group.name.en.toLowerCase()} can be chosen.`, group.id);
    }
    if (group.type === "multi" && chosen.length > group.maxSelect) {
      throw invalid(
        `Choose at most ${group.maxSelect} from ${group.name.en}.`,
        group.id,
      );
    }
    if (chosen.some((option) => !option.isAvailable)) {
      throw invalid(
        `One of the ${group.name.en.toLowerCase()} choices is sold out.`,
        group.id,
      );
    }

    for (const option of chosen) {
      selectedOptions.push({
        groupId: group.id,
        groupName: group.name,
        optionId: option.id,
        optionName: option.name,
        priceDelta: option.priceDelta,
      });
    }
  }

  return {
    lineKey: cartLineKey(
      item.id,
      selectedOptions.map((o) => o.optionId),
      notes,
    ),
    menuItemId: item.id,
    slug: item.slug,
    name: item.name,
    image: item.images[0] ?? "",
    isVeg: item.isVeg,
    unitPrice: item.price,
    selectedOptions,
    quantity,
    notes: notes?.trim() || undefined,
    prepMinutes: item.prepMinutes,
  };
}

export interface PriceCartInput {
  lines: CartLine[];
  outletId: OutletId;
  couponCode?: string;
  /** Packaging is charged on takeaway only. Defaults to takeaway. */
  orderType?: OrderType;
}

/** Full costing: options, coupon, packaging, GST. */
export async function priceCart({
  lines,
  outletId,
  couponCode,
  orderType = "TAKEAWAY",
}: PriceCartInput): Promise<PricedCart> {
  await ready();
  const config = settingsFor(outletId);
  const pricedLines = lines.map(priceLine);

  let discount = 0;
  let appliedCode: string | undefined;

  if (couponCode && pricedLines.length > 0) {
    const wanted = couponCode.trim().toUpperCase();
    const coupon = readCollection<Coupon>("coupons").find((c) => c.code === wanted);
    if (coupon) {
      const result = evaluateCoupon(
        coupon,
        pricedLines,
        readCollection<MenuItem>("menuItems"),
        getCurrentUser()?.id ?? null,
      );
      if (result.isEligible) {
        discount = result.discount;
        appliedCode = coupon.code;
      }
    }
  }

  return computeTotals({
    lines: pricedLines,
    discount,
    packagingCharge: config.packagingCharge,
    taxRate: config.taxRate,
    appliedCouponCode: appliedCode,
    orderType,
  });
}

/** How many orders this outlet's counter is currently working on. */
export function countActiveOrders(outletId: OutletId): number {
  return readCollection<Order>("orders").filter(
    (order) =>
      order.outletId === outletId &&
      (order.status === "PLACED" ||
        order.status === "ACCEPTED" ||
        order.status === "PREPARING" ||
        order.status === "READY"),
  ).length;
}

/** "Ready by" estimate for the current cart. */
export async function estimateReadyTime(
  lines: CartLine[],
  outletId: OutletId,
  from?: Date,
): Promise<Date> {
  await ready();
  return estimateReadyAtForLines(
    lines,
    countActiveOrders(outletId),
    settingsFor(outletId),
    from,
  );
}

/**
 * Re-checks availability at checkout. An item can sell out in another tab
 * between adding to the cart and paying, and we must not take money for it.
 * An item from the other outlet counts as unavailable too — carts are kept
 * apart, but a stale one must never be billed against the wrong counter.
 */
export async function validateCartAvailability(
  lines: CartLine[],
  outletId: OutletId,
): Promise<{
  ok: boolean;
  unavailable: Array<{ lineKey: string; name: string }>;
}> {
  await ready();
  const menu = new Map(readCollection<MenuItem>("menuItems").map((i) => [i.id, i]));
  const unavailable: Array<{ lineKey: string; name: string }> = [];

  for (const line of lines) {
    const item = menu.get(line.menuItemId);
    if (!item || !item.isAvailable || item.outletId !== outletId) {
      unavailable.push({ lineKey: line.lineKey, name: line.name.en });
    }
  }
  return { ok: unavailable.length === 0, unavailable };
}
