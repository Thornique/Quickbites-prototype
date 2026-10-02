/**
 * Data helpers, one module per domain. Plain typed functions over the
 * localStorage adapter — no backend, no API routes.
 *
 * UI components import from here (or from the feature hooks in
 * src/features/<domain>) and never touch localStorage directly.
 *
 * Import the module you need rather than this barrel where possible, so a
 * single page does not pull in every domain:
 *   import { listMenuItems } from "@/services/menu";
 */

export * as auth from "./auth";
export * as bookings from "./bookings";
export * as cartPricing from "./cart-pricing";
export * as categories from "./categories";
export * as content from "./content";
export * as coupons from "./coupons";
export * as customers from "./customers";
export * as enquiries from "./enquiries";
export * as inventory from "./inventory";
export * as menu from "./menu";
export * as orders from "./orders";
export * as reports from "./reports";
export * as reviews from "./reviews";
export * as settings from "./settings";
export * as staff from "./staff";

export { getCurrentUser, getStoredSession } from "./common";
export type { StoredSession } from "./common";
