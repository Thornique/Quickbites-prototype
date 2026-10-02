"use client";

import { useEffect } from "react";
import { useSession } from "@/features/auth";
import { useCartStore } from "@/store/cart";

/**
 * Keeps the loaded cart in step with who is signed in: merges the guest
 * basket on sign-in, and parks it again on sign-out. Mounted once in the
 * site layout.
 */
export function CartSync() {
  const { user, isReady } = useSession();
  const isHydrated = useCartStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isReady || !isHydrated) return;
    useCartStore.getState().syncOwner(user?.id ?? null);
  }, [isReady, isHydrated, user?.id]);

  return null;
}
