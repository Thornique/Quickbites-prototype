import { conflict, invalid, notFound } from "@/lib/errors";
import { couponDiscountFor } from "@/lib/pricing";
import { readCollection, writeCollection } from "@/storage";
import type {
  Coupon,
  CouponEvaluation,
  CouponRejectionReason,
  MenuItem,
  Order,
  OutletId,
  PricedCartLine,
} from "@/types";
import {
  getCurrentUser,
  logActivity,
  newId,
  nowIso,
  ready,
  requirePermission,
} from "./common";
import { assertOutletAccess, requireOutlet } from "./outlets";

/** Lifecycle state shown in the admin coupon list. */
export type CouponState = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "EXHAUSTED" | "INACTIVE";

export function couponState(coupon: Coupon, now = new Date()): CouponState {
  if (!coupon.isActive) return "INACTIVE";
  if (coupon.usedCount >= coupon.usageLimit) return "EXHAUSTED";
  const t = now.getTime();
  if (t < Date.parse(coupon.validFrom)) return "SCHEDULED";
  if (t > Date.parse(coupon.validTo)) return "EXPIRED";
  return "ACTIVE";
}

/** Portion of the cart a coupon may discount, honouring category limits. */
function eligibleSubtotal(
  coupon: Coupon,
  lines: PricedCartLine[],
  menu: MenuItem[],
): number {
  if (coupon.categoryIds.length === 0) {
    return lines.reduce((sum, line) => sum + line.lineTotal, 0);
  }
  const categoryById = new Map(menu.map((item) => [item.id, item.categoryId]));
  return lines
    .filter((line) => {
      const categoryId = categoryById.get(line.menuItemId);
      return categoryId ? coupon.categoryIds.includes(categoryId) : false;
    })
    .reduce((sum, line) => sum + line.lineTotal, 0);
}

function countPriorUses(code: string, customerId: string): number {
  return readCollection<Order>("orders").filter(
    (order) =>
      order.customerId === customerId &&
      order.couponCode === code &&
      order.status !== "CANCELLED",
  ).length;
}

/**
 * Decides whether a coupon applies to the given cart and what it is worth.
 * Never throws for an ineligible coupon — the UI needs the reason to explain
 * why, and to show "add ₹60 more to use this".
 */
export function evaluateCoupon(
  coupon: Coupon,
  lines: PricedCartLine[],
  menu: MenuItem[],
  customerId: string | null,
  now = new Date(),
): CouponEvaluation {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const reject = (
    reason: CouponRejectionReason,
    amountNeeded?: number,
  ): CouponEvaluation => ({
    coupon,
    isEligible: false,
    discount: 0,
    reason,
    amountNeeded,
  });

  const state = couponState(coupon, now);
  if (state === "INACTIVE") return reject("INACTIVE");
  if (state === "SCHEDULED") return reject("NOT_STARTED");
  if (state === "EXPIRED") return reject("EXPIRED");
  if (state === "EXHAUSTED") return reject("USAGE_LIMIT_REACHED");

  if (subtotal < coupon.minOrder) {
    return reject("MIN_ORDER_NOT_MET", coupon.minOrder - subtotal);
  }

  const eligible = eligibleSubtotal(coupon, lines, menu);
  if (eligible <= 0) return reject("NO_ELIGIBLE_ITEMS");

  if (customerId && countPriorUses(coupon.code, customerId) >= coupon.perUserLimit) {
    return reject("PER_USER_LIMIT_REACHED");
  }

  return { coupon, isEligible: true, discount: couponDiscountFor(coupon, eligible) };
}

export async function listCoupons(
  outletId: OutletId,
  activeOnly = false,
): Promise<Coupon[]> {
  await ready();
  const rows = readCollection<Coupon>("coupons").filter((c) => c.outletId === outletId);
  return activeOnly ? rows.filter((c) => couponState(c) === "ACTIVE") : rows;
}

/** A coupon by code. Codes are unique within an outlet, not across both. */
export async function getCouponByCode(
  outletId: OutletId,
  code: string,
): Promise<Coupon> {
  await ready();
  const normalised = code.trim().toUpperCase();
  const coupon = readCollection<Coupon>("coupons").find(
    (c) => c.code === normalised && c.outletId === outletId,
  );
  if (!coupon) throw notFound(`Coupon "${normalised}"`);
  return coupon;
}

/** Evaluates a code typed into the cart, against the current customer. */
export async function applyCouponCode(
  outletId: OutletId,
  code: string,
  lines: PricedCartLine[],
): Promise<CouponEvaluation> {
  await ready();
  const coupon = await getCouponByCode(outletId, code);
  const menu = readCollection<MenuItem>("menuItems");
  return evaluateCoupon(coupon, lines, menu, getCurrentUser()?.id ?? null);
}

/** Every coupon with its eligibility, for the "Available offers" list. */
export async function listOffersForCart(
  outletId: OutletId,
  lines: PricedCartLine[],
): Promise<CouponEvaluation[]> {
  await ready();
  const menu = readCollection<MenuItem>("menuItems");
  const customerId = getCurrentUser()?.id ?? null;
  return readCollection<Coupon>("coupons")
    .filter((c) => c.outletId === outletId)
    .filter((c) => {
      const state = couponState(c);
      return state === "ACTIVE" || state === "EXHAUSTED";
    })
    .map((c) => evaluateCoupon(c, lines, menu, customerId))
    .sort(
      (a, b) => Number(b.isEligible) - Number(a.isEligible) || b.discount - a.discount,
    );
}

/** Increments usage after an order is placed. */
export function recordCouponUse(outletId: OutletId, code: string): void {
  const rows = readCollection<Coupon>("coupons");
  writeCollection(
    "coupons",
    rows.map((c) =>
      c.code === code && c.outletId === outletId
        ? { ...c, usedCount: c.usedCount + 1 }
        : c,
    ),
    "update",
  );
}

export async function createCoupon(
  input: Omit<Coupon, "id" | "createdAt" | "usedCount" | "outletId"> & {
    outletId?: OutletId;
  },
): Promise<Coupon> {
  await ready();
  const admin = requirePermission("COUPONS");
  const outletId = requireOutlet(input.outletId);
  const rows = readCollection<Coupon>("coupons");

  const code = input.code.trim().toUpperCase();
  if (!code) throw invalid("A coupon needs a code.", "code");
  if (rows.some((c) => c.code === code && c.outletId === outletId))
    throw conflict(`Coupon ${code} already exists.`);
  if (input.type === "PERCENT" && (input.value <= 0 || input.value > 100)) {
    throw invalid("A percentage discount must be between 1 and 100.", "value");
  }
  if (Date.parse(input.validTo) <= Date.parse(input.validFrom)) {
    throw invalid("The end date must be after the start date.", "validTo");
  }

  const coupon: Coupon = {
    ...input,
    outletId,
    code,
    id: newId("coupon"),
    usedCount: 0,
    createdAt: nowIso(),
  };
  writeCollection("coupons", [...rows, coupon], "create", coupon.id);
  logActivity(admin, "COUPON_CREATED", `Created coupon ${coupon.code}`, coupon.id);
  return coupon;
}

export async function updateCoupon(
  id: string,
  patch: Partial<Omit<Coupon, "id" | "createdAt" | "outletId">>,
): Promise<Coupon> {
  await ready();
  const admin = requirePermission("COUPONS");
  const rows = readCollection<Coupon>("coupons");
  const existing = rows.find((c) => c.id === id);
  if (!existing) throw notFound("Coupon");
  assertOutletAccess(existing.outletId);

  const code = patch.code ? patch.code.trim().toUpperCase() : existing.code;
  if (
    rows.some((c) => c.code === code && c.id !== id && c.outletId === existing.outletId)
  ) {
    throw conflict(`Coupon ${code} already exists.`);
  }

  const next: Coupon = { ...existing, ...patch, code, id, updatedAt: nowIso() };
  writeCollection(
    "coupons",
    rows.map((c) => (c.id === id ? next : c)),
    "update",
    id,
  );
  logActivity(admin, "COUPON_UPDATED", `Updated coupon ${next.code}`, id);
  return next;
}

export async function deleteCoupon(id: string): Promise<void> {
  await ready();
  const admin = requirePermission("COUPONS");
  const rows = readCollection<Coupon>("coupons");
  const existing = rows.find((c) => c.id === id);
  if (!existing) throw notFound("Coupon");
  assertOutletAccess(existing.outletId);

  writeCollection(
    "coupons",
    rows.filter((c) => c.id !== id),
    "delete",
    id,
  );
  logActivity(admin, "COUPON_DELETED", `Deleted coupon ${existing.code}`, id);
}
