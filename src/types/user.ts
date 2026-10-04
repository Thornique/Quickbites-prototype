import type { IsoDateTime, Timestamped } from "./common";
import type { OutletId } from "./outlet";

export const ROLES = ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Module-level permissions for admin accounts. STAFF is intentionally absent:
 * managing other admins is reserved for the single SUPER_ADMIN.
 */
export const PERMISSIONS = [
  "ORDERS",
  "MENU",
  "INVENTORY",
  "COUPONS",
  "CUSTOMERS",
  "ENQUIRIES",
  "BOOKINGS",
  "CONTENT",
  "REPORTS",
  "SETTINGS",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const USER_STATUSES = ["ACTIVE", "BLOCKED", "INACTIVE"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface User extends Timestamped {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** SHA-256 hex digest via Web Crypto. Prototype only — never production auth. */
  passwordHash: string;
  role: Role;
  /** Empty for customers; SUPER_ADMIN implicitly holds every permission. */
  permissions: Permission[];
  /**
   * The one outlet an ADMIN works at. Unset for customers, and for the
   * SUPER_ADMIN, who is not tied to an outlet and sees every one of them.
   */
  assignedOutletId?: OutletId;
  status: UserStatus;
  /** Admin-only free-text note shown on the customer detail screen. */
  notes?: string;
  lastLoginAt?: IsoDateTime;
}

/** The current signed-in user, minus anything secret. */
export type SessionUser = Omit<User, "passwordHash">;

/** Row in the admin activity log. */
export interface ActivityLogEntry {
  id: string;
  at: IsoDateTime;
  byUserId: string;
  byName: string;
  /** e.g. "ORDER_ACCEPTED", "MENU_ITEM_UPDATED". */
  action: string;
  /** Human-readable summary rendered in the activity feed. */
  summary: string;
  entityId?: string;
}
