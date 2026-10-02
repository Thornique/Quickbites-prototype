import type { CartLine, Coupon, OrderType, PricedCart, PricedCartLine } from "@/types";

/**
 * Pure money maths, shared by the cart-pricing service and the seed generator
 * so a historical order and a live cart can never disagree about totals.
 */

/** Rupee amounts are whole numbers everywhere in the UI. */
export function roundRupee(amount: number): number {
  return Math.round(amount);
}

/** Unit price including option deltas, then multiplied by quantity. */
export function priceLine(line: CartLine): PricedCartLine {
  const optionDelta = line.selectedOptions.reduce(
    (sum, option) => sum + option.priceDelta,
    0,
  );
  const unitTotal = roundRupee(line.unitPrice + optionDelta);
  return { ...line, unitTotal, lineTotal: unitTotal * line.quantity };
}

export function subtotalOf(lines: PricedCartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}

/**
 * Discount a coupon yields on an eligible subtotal, respecting the percentage
 * cap. Never exceeds the eligible amount — a coupon cannot make an order free.
 */
export function couponDiscountFor(coupon: Coupon, eligibleSubtotal: number): number {
  if (eligibleSubtotal <= 0) return 0;

  const raw =
    coupon.type === "PERCENT" ? (eligibleSubtotal * coupon.value) / 100 : coupon.value;

  const capped =
    coupon.type === "PERCENT" && typeof coupon.maxDiscount === "number"
      ? Math.min(raw, coupon.maxDiscount)
      : raw;

  return roundRupee(Math.min(capped, eligibleSubtotal));
}

export interface TotalsInput {
  lines: PricedCartLine[];
  discount: number;
  /** The configured charge; only applied when the order is a takeaway. */
  packagingCharge: number;
  /** GST percentage, e.g. 5. */
  taxRate: number;
  appliedCouponCode?: string;
  /** Dine-in food is served on a plate, so it carries no packaging charge. */
  orderType: OrderType;
}

/** Packaging is charged on takeaway only, and only on a non-empty cart. */
export function packagingFor(
  orderType: OrderType,
  configuredCharge: number,
  lineCount: number,
): number {
  if (orderType !== "TAKEAWAY" || lineCount === 0) return 0;
  return configuredCharge;
}

/**
 * GST is charged on the discounted food value plus the packaging charge,
 * which is how a takeaway bill is normally composed in India.
 */
export function computeTotals({
  lines,
  discount,
  packagingCharge,
  taxRate,
  appliedCouponCode,
  orderType,
}: TotalsInput): PricedCart {
  const subtotal = subtotalOf(lines);
  const safeDiscount = Math.min(roundRupee(discount), subtotal);
  const packaging = packagingFor(orderType, packagingCharge, lines.length);
  const taxableBase = Math.max(0, subtotal - safeDiscount + packaging);
  const tax = roundRupee((taxableBase * taxRate) / 100);

  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    discount: safeDiscount,
    appliedCouponCode,
    packagingCharge: packaging,
    orderType,
    taxRate,
    tax,
    total: taxableBase + tax,
  };
}

/**
 * Stable identity for a cart line: same item with the same options and the
 * same note merges; any difference creates a separate line.
 */
export function cartLineKey(
  menuItemId: string,
  optionIds: string[],
  notes?: string,
): string {
  const options = [...optionIds].sort().join(",");
  const note = (notes ?? "").trim().toLowerCase();
  return `${menuItemId}|${options}|${note}`;
}
