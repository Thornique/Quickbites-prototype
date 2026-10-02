import type { LocalizedText } from "./common";

/** A choice the customer made inside an option group, snapshotted with its price. */
export interface SelectedOption {
  groupId: string;
  groupName: LocalizedText;
  optionId: string;
  optionName: LocalizedText;
  priceDelta: number;
}

/**
 * One line in the cart. Two lines with the same item but different options are
 * separate lines; identical option sets merge, which `lineKey` decides.
 */
export interface CartLine {
  /** Stable hash of menuItemId + sorted option ids + notes. */
  lineKey: string;
  menuItemId: string;
  slug: string;
  name: LocalizedText;
  image: string;
  isVeg: boolean;
  /** Base price at the time the line was added. */
  unitPrice: number;
  selectedOptions: SelectedOption[];
  quantity: number;
  notes?: string;
  prepMinutes: number;
}

/** Fully costed cart, produced by the cart-pricing service. */
export interface PricedCart {
  lines: PricedCartLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  appliedCouponCode?: string;
  packagingCharge: number;
  taxRate: number;
  tax: number;
  total: number;
}

export interface PricedCartLine extends CartLine {
  /** unitPrice + option deltas, for a single unit. */
  unitTotal: number;
  /** unitTotal × quantity. */
  lineTotal: number;
}
