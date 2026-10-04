"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_OUTLET_ID } from "@/lib/outlets";
import { ADMIN_OUTLET_KEY } from "@/storage";
import type { OutletScope } from "@/types";
import { isOutletId, OUTLET_SCOPE_ALL } from "@/types";

/**
 * Which outlet the admin panel is showing.
 *
 * Only the super admin ever changes this — an assigned admin's scope comes
 * from their account, and the services refuse anything else regardless. The
 * default is the restaurant rather than "all" so the catalogue, inventory and
 * settings screens open on something workable; "All" is one click away for
 * the combined dashboard and reports.
 */

function isScope(value: unknown): value is OutletScope {
  return value === OUTLET_SCOPE_ALL || isOutletId(value);
}

interface AdminOutletState {
  scope: OutletScope;
  isHydrated: boolean;
  setScope: (scope: OutletScope) => void;
}

export const useAdminOutletStore = create<AdminOutletState>()(
  persist(
    (set) => ({
      scope: DEFAULT_OUTLET_ID,
      isHydrated: false,
      setScope: (scope) => {
        if (!isScope(scope)) return;
        set({ scope });
      },
    }),
    {
      name: ADMIN_OUTLET_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ scope: state.scope }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    },
  ),
);
