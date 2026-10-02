"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { MenuItemImage } from "@/components/site/menu-item-image";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { VegMark } from "@/components/ui/veg-mark";
import { usePick, useT } from "@/i18n";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { PricedCartLine } from "@/types";

export interface CartLineRowProps {
  line: PricedCartLine;
  index: number;
  /** Compact rows for the drawer, roomier on the cart page. */
  dense?: boolean;
  className?: string;
}

/** One cart line, with its chosen options, note and a removal that can be undone. */
export function CartLineRow({
  line,
  index,
  dense = false,
  className,
}: CartLineRowProps) {
  const t = useT();
  const pick = usePick();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const restoreLine = useCartStore((s) => s.restoreLine);

  const name = pick(line.name);
  const options = line.selectedOptions.map((option) => pick(option.optionName));

  const handleRemove = () => {
    const removed = removeLine(line.lineKey);
    if (!removed) return;
    toast(t.cartPage.removed(name), {
      action: {
        label: t.cartPage.undo,
        onClick: () => restoreLine(removed, index),
      },
    });
  };

  return (
    <div className={cn("flex gap-3 py-4", dense ? "px-4" : "px-0 sm:gap-4", className)}>
      <MenuItemImage
        src={line.image || undefined}
        alt={name}
        sizes="80px"
        className={cn(
          "@container shrink-0 rounded-control",
          dense ? "size-16" : "size-20",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <VegMark isVeg={line.isVeg} size="sm" className="mt-1" />
          <p className="min-w-0 flex-1 text-sm leading-snug font-semibold text-ink">
            {name}
          </p>
          <button
            type="button"
            onClick={handleRemove}
            aria-label={t.cartPage.remove(name)}
            className="-mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {options.length > 0 && (
          <p className="mt-0.5 text-xs text-ink-muted">{options.join(" · ")}</p>
        )}
        {line.notes && (
          <p className="mt-0.5 text-xs text-ink-muted italic">“{line.notes}”</p>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <QuantityStepper
            value={line.quantity}
            onChange={(next) => setQuantity(line.lineKey, next)}
            removable
            onRemove={handleRemove}
            size="sm"
            itemLabel={name}
          />
          <Price value={line.lineTotal} size="md" />
        </div>
      </div>
    </div>
  );
}
