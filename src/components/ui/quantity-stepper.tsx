"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Show a bin icon instead of "−" when decrementing past `min` removes the line. */
  removable?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md";
  disabled?: boolean;
  /** Describes what is being counted, for screen readers. */
  itemLabel?: string;
  className?: string;
}

/**
 * Compact −/+ control used on menu cards, the cart and the customise sheet.
 * The count is tabular so the control does not resize between 9 and 10.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  removable = false,
  onRemove,
  size = "md",
  disabled = false,
  itemLabel = "item",
  className,
}: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  const showRemove = removable && atMin;

  const handleDecrement = () => {
    if (showRemove) {
      onRemove?.();
      return;
    }
    if (!atMin) onChange(value - 1);
  };

  const buttonSize = size === "sm" ? "size-7" : "size-9";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-control border border-hairline bg-surface",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || (atMin && !showRemove)}
        aria-label={
          showRemove ? `Remove ${itemLabel}` : `Decrease ${itemLabel} quantity`
        }
        className={cn(
          "inline-flex items-center justify-center rounded-l-control text-ink transition-colors",
          "hover:bg-sand-50 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-inset",
          "disabled:pointer-events-none disabled:text-ink-muted/40",
          showRemove && "text-danger hover:bg-danger/10",
          buttonSize,
        )}
      >
        {showRemove ? (
          <Trash2 size={iconSize} strokeWidth={1.75} />
        ) : (
          <Minus size={iconSize} strokeWidth={2.25} />
        )}
      </button>

      <span
        aria-live="polite"
        className={cn(
          "nums min-w-8 text-center font-semibold text-ink",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {value}
        <span className="sr-only"> {itemLabel}</span>
      </span>

      <button
        type="button"
        onClick={() => !atMax && onChange(value + 1)}
        disabled={disabled || atMax}
        aria-label={`Increase ${itemLabel} quantity`}
        className={cn(
          "inline-flex items-center justify-center rounded-r-control text-ink transition-colors",
          "hover:bg-sand-50 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-inset",
          "disabled:pointer-events-none disabled:text-ink-muted/40",
          buttonSize,
        )}
      >
        <Plus size={iconSize} strokeWidth={2.25} />
      </button>
    </div>
  );
}
