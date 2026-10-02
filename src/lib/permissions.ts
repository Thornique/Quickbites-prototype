import type { Permission, Role, SessionUser, User } from "@/types";
import { PERMISSIONS } from "@/types";

type PermissionHolder = Pick<User, "role" | "permissions" | "status">;

/**
 * Single authority on "may this user do X". Used by the UI to hide controls
 * AND by every service to refuse the action — hiding a button is not security,
 * even in a prototype.
 */
export function can(
  user: PermissionHolder | SessionUser | null | undefined,
  permission: Permission,
): boolean {
  if (!user || user.status !== "ACTIVE") return false;
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role !== "ADMIN") return false;
  return user.permissions.includes(permission);
}

/** Staff management is reserved for the single super admin. */
export function canManageStaff(
  user: PermissionHolder | SessionUser | null | undefined,
): boolean {
  return !!user && user.status === "ACTIVE" && user.role === "SUPER_ADMIN";
}

/** True for any account allowed into /admin at all. */
export function isAdminRole(role: Role): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/** Every permission an account effectively holds, expanding SUPER_ADMIN. */
export function effectivePermissions(
  user: PermissionHolder | SessionUser | null | undefined,
): Permission[] {
  if (!user || user.status !== "ACTIVE") return [];
  if (user.role === "SUPER_ADMIN") return [...PERMISSIONS];
  if (user.role !== "ADMIN") return [];
  return user.permissions.filter((p) => PERMISSIONS.includes(p));
}

/** Human labels for the staff permission checkboxes. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  ORDERS: "Orders",
  MENU: "Menu & categories",
  INVENTORY: "Inventory",
  COUPONS: "Coupons",
  CUSTOMERS: "Customers",
  ENQUIRIES: "Enquiries",
  BOOKINGS: "Table bookings",
  CONTENT: "Website content",
  REPORTS: "Reports",
  SETTINGS: "Settings",
};
