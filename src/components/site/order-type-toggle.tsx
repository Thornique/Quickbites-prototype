"use client";

import { ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useT } from "@/i18n";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { OrderType } from "@/types";

/**
 * Takeaway | Dine-in. The choice drives the packaging charge and which
 * payment methods checkout will offer, so it belongs at the top of the cart
 * rather than buried in checkout.
 */
export function OrderTypeToggle({ className }: { className?: string }) {
  const t = useT();
  const orderType = useCartStore((s) => s.orderType);
  const setOrderType = useCartStore((s) => s.setOrderType);

  const options: Array<{
    value: OrderType;
    label: string;
    hint: string;
    Icon: typeof ShoppingBag;
  }> = [
    {
      value: "TAKEAWAY",
      label: t.orderType.takeaway,
      hint: t.orderType.takeawayHint,
      Icon: ShoppingBag,
    },
    {
      value: "DINE_IN",
      label: t.orderType.dineIn,
      hint: t.orderType.dineInHint,
      Icon: UtensilsCrossed,
    },
  ];

  return (
    <fieldset className={cn("grid grid-cols-2 gap-2", className)}>
      <legend className="sr-only">{t.orderType.legend}</legend>
      {options.map((option) => {
        const isActive = orderType === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "cursor-pointer rounded-card border p-3 transition-colors",
              "focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2",
              isActive
                ? "border-brand bg-brand/5"
                : "border-hairline bg-surface hover:border-ink/20",
            )}
          >
            <input
              type="radio"
              name="orderType"
              value={option.value}
              checked={isActive}
              onChange={() => setOrderType(option.value)}
              className="sr-only"
            />
            <span className="flex items-center gap-2">
              <option.Icon
                size={18}
                strokeWidth={1.75}
                aria-hidden="true"
                className={isActive ? "text-brand" : "text-ink-muted"}
              />
              <span
                className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-brand" : "text-ink",
                )}
              >
                {option.label}
              </span>
            </span>
            <span className="mt-1 block text-xs text-ink-muted">{option.hint}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
