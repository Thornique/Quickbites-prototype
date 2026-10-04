"use client";

import { useCallback } from "react";
import { useSession } from "@/features/auth";
import { getOutlet } from "@/lib/outlets";
import { useAdminOutletStore } from "@/store/admin-outlet";
import type { Outlet, OutletId, OutletScope } from "@/types";
import { OUTLET_SCOPE_ALL } from "@/types";

export interface AdminOutletSnapshot {
  scope: OutletScope;
  /**
   * The single outlet to read and write, or undefined when the super admin is
   * looking at both. Pass it straight into the data hooks: `undefined` is what
   * they take to mean "every outlet".
   */
  outletId?: OutletId;
  /** True when the combined view is active. */
  isAll: boolean;
  /** Only the super admin may change outlet. */
  canSwitch: boolean;
  /** The outlet an assigned admin is pinned to, for the topbar label. */
  lockedOutlet?: Outlet;
  setScope: (scope: OutletScope) => void;
}

/**
 * The admin panel's outlet scope.
 *
 * An assigned ADMIN is pinned to their own outlet, with no switcher: the UI
 * reflects what the services already enforce rather than pretending there is
 * a choice. The SUPER_ADMIN picks Restaurant, Coffee or All.
 */
export function useAdminOutlet(): AdminOutletSnapshot {
  const { user } = useSession();
  const stored = useAdminOutletStore((s) => s.scope);
  const setStored = useAdminOutletStore((s) => s.setScope);

  const assigned =
    user?.role === "ADMIN" ? (user.assignedOutletId ?? undefined) : undefined;
  const scope: OutletScope = assigned ?? stored;
  const isAll = scope === OUTLET_SCOPE_ALL;

  return {
    scope,
    outletId: isAll ? undefined : scope,
    isAll,
    canSwitch: !assigned,
    lockedOutlet: assigned ? getOutlet(assigned) : undefined,
    setScope: useCallback(
      (next: OutletScope) => {
        if (assigned) return;
        setStored(next);
      },
      [assigned, setStored],
    ),
  };
}
