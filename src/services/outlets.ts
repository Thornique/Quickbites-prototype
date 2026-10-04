import { forbidden, invalid } from "@/lib/errors";
import { DEFAULT_OUTLET_ID, OUTLETS } from "@/lib/outlets";
import type { Outlet, OutletId, Role, User } from "@/types";
import { getCurrentUser } from "./common";

/**
 * Outlet access rules, enforced in the service layer.
 *
 * An ADMIN is pinned to one outlet and must not read or write another one's
 * data, whatever the UI lets them click. The SUPER_ADMIN has no fixed outlet
 * and may work across both, including a combined "all outlets" view.
 */

type OutletHolder = Pick<User, "role" | "assignedOutletId">;

/** The outlet an account is pinned to; null when it may see every outlet. */
export function assignedOutletOf(
  user: OutletHolder | null | undefined,
): OutletId | null {
  if (!user || user.role !== "ADMIN") return null;
  return user.assignedOutletId ?? null;
}

/**
 * The outlet the signed-in admin is locked to, or null when there is no lock
 * — either because nobody is signed in to the panel, or because the super
 * admin is, and they are not tied to an outlet.
 */
export function adminOutletLock(): OutletId | null {
  return assignedOutletOf(getCurrentUser("admin"));
}

/**
 * Read scope for an admin-only listing.
 *
 * A locked admin always gets their own outlet, whatever was asked for — a
 * stale selection in the UI should show them their own board, not an error.
 * `undefined` means "every outlet", which only the super admin can reach.
 */
export function adminReadScope(requested?: OutletId): OutletId | undefined {
  return adminOutletLock() ?? requested;
}

/**
 * Refuses a write aimed at an outlet the signed-in admin is not assigned to.
 * Called after requirePermission(), so an admin session is already guaranteed.
 */
export function assertOutletAccess(outletId: OutletId): void {
  const lock = adminOutletLock();
  if (lock && lock !== outletId) {
    throw forbidden(
      `You are assigned to ${OUTLETS[lock].name.en} and cannot change ${OUTLETS[outletId].name.en} data.`,
    );
  }
}

/**
 * The outlet a mutation must act on. A locked admin's own outlet wins; the
 * super admin has to say which one, because "all outlets" is not somewhere a
 * menu item or a coupon can be created.
 */
export function requireOutlet(requested?: OutletId): OutletId {
  const lock = adminOutletLock();
  if (lock) {
    if (requested && requested !== lock) assertOutletAccess(requested);
    return lock;
  }
  if (!requested) throw invalid("Choose an outlet first.", "outletId");
  return requested;
}

/** Which outlets an account may look at. */
export function visibleOutletsFor(user: OutletHolder | null | undefined): OutletId[] {
  const lock = assignedOutletOf(user);
  return lock ? [lock] : (Object.keys(OUTLETS) as OutletId[]);
}

/** Static facts about one outlet, for display next to the data. */
export function outletOf(id: OutletId): Outlet {
  return OUTLETS[id];
}

/** The outlet an admin account lands on when the panel first opens. */
export function defaultOutletFor(role: Role, assigned?: OutletId): OutletId {
  if (role === "ADMIN" && assigned) return assigned;
  return DEFAULT_OUTLET_ID;
}
