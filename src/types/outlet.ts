import type { LocalizedText } from "./common";

/**
 * The cafe now trades from two outlets. Everything the business owns —
 * catalogue, stock, coupons, orders, bookings, content — belongs to exactly
 * one of them, which is why `outletId` is a required field rather than an
 * optional afterthought: a record that belongs to nobody would show up on
 * both boards.
 */
export const OUTLET_IDS = ["restaurant", "coffee"] as const;
export type OutletId = (typeof OUTLET_IDS)[number];

/** What an admin can be looking at: one outlet, or everything at once. */
export const OUTLET_SCOPE_ALL = "all";
export type OutletScope = OutletId | typeof OUTLET_SCOPE_ALL;

export function isOutletId(value: unknown): value is OutletId {
  return typeof value === "string" && (OUTLET_IDS as readonly string[]).includes(value);
}

export interface Outlet {
  id: OutletId;
  name: LocalizedText;
  /** Used where the full name will not fit — chips, badges, table cells. */
  shortName: LocalizedText;
  /**
   * The CSS custom property this outlet paints its primary colour from.
   * `[data-outlet]` on <html> re-points --color-brand at it, so every existing
   * `bg-brand` / `text-brand` utility follows the outlet without being touched.
   */
  accentToken: string;
  address: LocalizedText;
  phone: string;
  /** Leading letter of the daily counter token — "A12" here, "C12" at coffee. */
  tokenPrefix: string;
}

/** Mixed into every record that belongs to one outlet. */
export interface OutletScoped {
  outletId: OutletId;
}
