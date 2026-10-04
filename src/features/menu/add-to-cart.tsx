"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
/*
  The option sheet is the heaviest thing on the menu route and most visits never
  open it — plenty of items add straight to the cart. It arrives on first use.
*/
const CustomiseSheet = dynamic(
  () => import("@/components/site/customise-sheet").then((m) => m.CustomiseSheet),
  { ssr: false },
);
import { useOutletId } from "@/features/outlet";
import { useOpenState } from "@/features/settings";
import { usePick, useT } from "@/i18n";
import { buildCartLine } from "@/services/cart-pricing";
import { useCartStore } from "@/store/cart";
import type { CartLine, MenuItem } from "@/types";

interface AddToCartValue {
  /** Adds straight away, or opens the option sheet when the item has groups. */
  requestAdd: (item: MenuItem) => void;
  /** Always opens the sheet — used by "+" on an item that has options. */
  openCustomise: (item: MenuItem) => void;
  /** True while the store is closed or has paused orders. */
  isOrderingDisabled: boolean;
}

const AddToCartContext = createContext<AddToCartValue | null>(null);

/**
 * Owns the single customise sheet and the add-to-cart toast.
 *
 * Mounted once per page rather than once per card: forty cards each rendering
 * their own Radix sheet would mean forty portals and forty focus traps.
 */
export function AddToCartProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const pick = usePick();
  const router = useRouter();
  const addLine = useCartStore((s) => s.addLine);
  const { data: openState } = useOpenState(useOutletId());

  const [item, setItem] = useState<MenuItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isOrderingDisabled =
    !!openState && !(openState.isOpen && openState.acceptingOrders);

  const confirm = useCallback(
    (line: CartLine, name: string) => {
      addLine(line);
      toast.success(t.item.addedToCart(name), {
        action: { label: t.cart.viewCart, onClick: () => router.push("/cart") },
      });
    },
    [addLine, router, t],
  );

  const openCustomise = useCallback((next: MenuItem) => {
    setItem(next);
    setIsSheetOpen(true);
  }, []);

  const requestAdd = useCallback(
    (next: MenuItem) => {
      if (isOrderingDisabled || !next.isAvailable) return;
      if (next.optionGroups.length > 0) {
        openCustomise(next);
        return;
      }
      confirm(buildCartLine(next, [], 1), pick(next.name));
    },
    [confirm, isOrderingDisabled, openCustomise, pick],
  );

  const value = useMemo<AddToCartValue>(
    () => ({ requestAdd, openCustomise, isOrderingDisabled }),
    [requestAdd, openCustomise, isOrderingDisabled],
  );

  return (
    <AddToCartContext.Provider value={value}>
      {children}
      <CustomiseSheet
        item={item}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        disabled={isOrderingDisabled}
        onAdd={(line) => confirm(line, item ? pick(item.name) : "")}
      />
    </AddToCartContext.Provider>
  );
}

export function useAddToCart(): AddToCartValue {
  const context = useContext(AddToCartContext);
  if (!context) {
    throw new Error("useAddToCart must be used inside <AddToCartProvider>.");
  }
  return context;
}
