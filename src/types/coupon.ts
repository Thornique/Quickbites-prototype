import type { IsoDateTime, LocalizedText, Timestamped } from "./common";

export type CouponType = "PERCENT" | "FLAT";

export interface Coupon extends Timestamped {
  id: string;
  /** Always stored uppercase and unique. */
  code: string;
  description: LocalizedText;
  type: CouponType;
  /** Percentage (1–100) when type is PERCENT, else a flat rupee amount. */
  value: number;
  /** Minimum cart subtotal required to apply. */
  minOrder: number;
  /** Caps the discount on PERCENT coupons. Undefined means uncapped. */
  maxDiscount?: number;
  validFrom: IsoDateTime;
  validTo: IsoDateTime;
  /** Total redemptions allowed across all customers. */
  usageLimit: number;
  usedCount: number;
  /** Redemptions allowed per customer. */
  perUserLimit: number;
  /** Restricts the coupon to these categories; empty means the whole menu. */
  categoryIds: string[];
  isActive: boolean;
}

/** Why a coupon could not be applied — drives the message shown to the customer. */
export type CouponRejectionReason =
  | "NOT_FOUND"
  | "INACTIVE"
  | "NOT_STARTED"
  | "EXPIRED"
  | "MIN_ORDER_NOT_MET"
  | "USAGE_LIMIT_REACHED"
  | "PER_USER_LIMIT_REACHED"
  | "NO_ELIGIBLE_ITEMS";

export interface CouponEvaluation {
  coupon: Coupon;
  isEligible: boolean;
  /** Discount in rupees if applied now; 0 when not eligible. */
  discount: number;
  reason?: CouponRejectionReason;
  /** Shortfall in rupees when the reason is MIN_ORDER_NOT_MET. */
  amountNeeded?: number;
}
