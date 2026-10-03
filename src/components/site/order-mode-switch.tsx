"use client";

import { useId } from "react";

import { useT } from "@/i18n";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { OrderType } from "@/types";

/**
 * Header order-mode switch: TAKEAWAY ⟷ DINE IN, laid out like the one big
 * fast-food chains put in their top bar — both labels always readable, the
 * active one in brand red, a physical-looking knob between them.
 *
 * It writes to the same cart store as the toggle in the cart, so the choice
 * carries through to checkout; nothing new is decided here.
 */
export function OrderModeSwitch({ className }: { className?: string }) {
  const t = useT();
  const orderType = useCartStore((s) => s.orderType);
  const setOrderType = useCartStore((s) => s.setOrderType);

  const isDineIn = orderType === "DINE_IN";
  // The header renders a desktop and a mobile copy; a shared radio name would
  // make the browser treat all four inputs as one group and fight React.
  const groupName = `orderMode-${useId()}`;

  const select = (value: OrderType) => () => setOrderType(value);
  const labelClass = (active: boolean) =>
    cn(
      "cursor-pointer text-xs font-bold tracking-wide whitespace-nowrap uppercase transition-colors",
      "rounded-control px-0.5 focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2",
      active ? "text-brand" : "text-ink-muted hover:text-ink",
    );

  return (
    <fieldset className={cn("inline-flex shrink-0 items-center gap-2 sm:gap-2.5", className)}>
      <legend className="sr-only">{t.orderType.legend}</legend>

      <label className={labelClass(!isDineIn)}>
        <input
          type="radio"
          name={groupName}
          value="TAKEAWAY"
          checked={!isDineIn}
          onChange={select("TAKEAWAY")}
          className="sr-only"
        />
        {t.orderType.takeaway}
      </label>

      {/* Decorative: the two labels above are the real controls. */}
      <button
        type="button"
        onClick={select(isDineIn ? "TAKEAWAY" : "DINE_IN")}
        tabIndex={-1}
        aria-hidden="true"
        className="inline-flex h-6 w-11 shrink-0 items-center rounded-pill bg-cocoa p-0.5 transition-colors"
      >
        <span
          className={cn(
            "size-5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out motion-reduce:transition-none",
            isDineIn && "translate-x-5",
          )}
        />
      </button>

      <label className={labelClass(isDineIn)}>
        <input
          type="radio"
          name={groupName}
          value="DINE_IN"
          checked={isDineIn}
          onChange={select("DINE_IN")}
          className="sr-only"
        />
        {t.orderType.dineIn}
      </label>
    </fieldset>
  );
}
