"use client";

import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { VegMark } from "@/components/ui/veg-mark";
import { Button } from "@/components/ui/button";
import { usePick, useT } from "@/i18n";
import { MAX_ITEM_NOTE_LENGTH } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { priceLine } from "@/lib/pricing";
import { buildCartLine } from "@/services/cart-pricing";
import { cn } from "@/lib/utils";
import type { CartLine, MenuItem, OptionGroup } from "@/types";

export interface CustomiseSheetProps {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (line: CartLine) => void;
  /** Disabled while the store is closed or not accepting orders. */
  disabled?: boolean;
}

/** Pre-selects the first available choice in every required single-select group. */
function defaultSelection(item: MenuItem): string[] {
  const selected: string[] = [];
  for (const group of item.optionGroups) {
    if (group.type === "single" && group.isRequired) {
      const first = group.options.find((o) => o.isAvailable);
      if (first) selected.push(first.id);
    }
  }
  return selected;
}

/**
 * Option picker. A bottom sheet on mobile and a centred panel on desktop,
 * both from the same Radix Sheet so focus trapping and escape behaviour are
 * identical.
 *
 * The running total comes from lib/pricing.ts — the same function that prices
 * the real cart — so what the customer is quoted here cannot drift from what
 * they are charged.
 */
export function CustomiseSheet({
  item,
  open,
  onOpenChange,
  onAdd,
  disabled = false,
}: CustomiseSheetProps) {
  const t = useT();
  const pick = usePick();

  const [selected, setSelected] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset whenever a different item is opened.
  useEffect(() => {
    if (!item || !open) return;
    setSelected(defaultSelection(item));
    setQuantity(1);
    setNotes("");
    setError(null);
  }, [item, open]);

  const preview = useMemo(() => {
    if (!item) return null;
    try {
      return priceLine(buildCartLine(item, selected, quantity, notes));
    } catch {
      // An incomplete required group — the button press reports it properly.
      return null;
    }
  }, [item, selected, quantity, notes]);

  if (!item) return null;

  const toggle = (group: OptionGroup, optionId: string, checked: boolean) => {
    setError(null);
    setSelected((current) => {
      const groupIds = new Set(group.options.map((o) => o.id));
      const others = current.filter((id) => !groupIds.has(id));
      const mine = current.filter((id) => groupIds.has(id));

      if (group.type === "single") return checked ? [...others, optionId] : others;

      if (!checked) return [...others, ...mine.filter((id) => id !== optionId)];
      if (mine.length >= group.maxSelect) {
        setError(t.customise.maxReached(group.maxSelect));
        return current;
      }
      return [...others, ...mine, optionId];
    });
  };

  const handleAdd = () => {
    setError(null);
    try {
      onAdd(buildCartLine(item, selected, quantity, notes));
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.common.somethingWentWrong);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          "flex max-h-[88dvh] flex-col gap-0 p-0",
          // Centre it as a dialog once there is room for one. The side="bottom"
          // placement in SheetContent is an attribute selector, so these have to
          // repeat the data-side variant to outrank it rather than just use sm:.
          "sm:data-[side=bottom]:inset-x-auto sm:data-[side=bottom]:inset-y-auto",
          "sm:data-[side=bottom]:top-1/2 sm:data-[side=bottom]:left-1/2",
          "sm:data-[side=bottom]:w-[28rem] sm:data-[side=bottom]:max-h-[85dvh]",
          "sm:data-[side=bottom]:-translate-x-1/2 sm:data-[side=bottom]:-translate-y-1/2",
          "sm:data-[side=bottom]:rounded-card sm:data-[side=bottom]:border",
        )}
      >
        <SheetHeader className="border-b border-hairline p-5 text-left">
          <SheetTitle className="flex items-start gap-2 text-lg">
            <VegMark isVeg={item.isVeg} className="mt-1" />
            <span>{pick(item.name)}</span>
          </SheetTitle>
          <SheetDescription className="clamp-2">
            {pick(item.description)}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {item.optionGroups.map((group) => {
            const chosen = selected.filter((id) =>
              group.options.some((o) => o.id === id),
            );
            return (
              <fieldset key={group.id} className="mb-6 last:mb-0">
                <legend className="flex w-full items-baseline justify-between gap-3 pb-2">
                  <span className="text-sm font-semibold text-ink">
                    {pick(group.name)}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {group.isRequired && (
                      <span className="mr-2 font-semibold text-brand">
                        {t.customise.required}
                      </span>
                    )}
                    {group.type === "single"
                      ? t.customise.chooseOne
                      : t.customise.chooseUpTo(group.maxSelect)}
                  </span>
                </legend>

                {group.type === "single" ? (
                  <RadioGroup
                    value={chosen[0] ?? ""}
                    onValueChange={(value) => toggle(group, value, true)}
                    className="gap-0"
                  >
                    {group.options.map((option) => (
                      <OptionRow
                        key={option.id}
                        id={option.id}
                        label={pick(option.name)}
                        priceDelta={option.priceDelta}
                        disabled={!option.isAvailable}
                        soldOutLabel={t.customise.soldOutOption}
                        control={
                          <RadioGroupItem
                            value={option.id}
                            id={option.id}
                            disabled={!option.isAvailable}
                          />
                        }
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <div>
                    {group.options.map((option) => (
                      <OptionRow
                        key={option.id}
                        id={option.id}
                        label={pick(option.name)}
                        priceDelta={option.priceDelta}
                        disabled={!option.isAvailable}
                        soldOutLabel={t.customise.soldOutOption}
                        control={
                          <Checkbox
                            id={option.id}
                            checked={chosen.includes(option.id)}
                            disabled={!option.isAvailable}
                            onCheckedChange={(checked) =>
                              toggle(group, option.id, checked === true)
                            }
                          />
                        }
                      />
                    ))}
                  </div>
                )}
              </fieldset>
            );
          })}

          <div className="mt-2 grid gap-1.5">
            <Label htmlFor="item-notes">{t.customise.notes}</Label>
            <Textarea
              id="item-notes"
              value={notes}
              maxLength={MAX_ITEM_NOTE_LENGTH}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t.customise.notesPlaceholder}
              rows={2}
            />
            <p className="nums text-right text-xs text-ink-muted">
              {t.customise.notesCount(notes.length, MAX_ITEM_NOTE_LENGTH)}
            </p>
          </div>
        </div>

        <div className="border-t border-hairline bg-surface p-4">
          {error && (
            <p role="alert" className="mb-3 text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              itemLabel={pick(item.name)}
            />
            <Button
              size="lg"
              className="flex-1"
              disabled={disabled}
              onClick={handleAdd}
            >
              {t.customise.addForPrice(formatPrice(preview?.lineTotal ?? item.price))}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** One selectable option row, with its price delta on the right. */
function OptionRow({
  id,
  label,
  priceDelta,
  disabled,
  soldOutLabel,
  control,
}: {
  id: string;
  label: string;
  priceDelta: number;
  disabled: boolean;
  soldOutLabel: string;
  control: React.ReactNode;
}) {
  return (
    /* data-option-row is the hook the coffee outlet's CSS uses to turn these
       rows into selectable pills — see globals.css. */
    <div
      data-option-row
      className={cn(
        "flex items-center gap-3 border-b border-hairline py-3 last:border-0",
        disabled && "opacity-50",
      )}
    >
      {control}
      <Label
        htmlFor={id}
        className={cn("flex-1 font-normal", disabled && "cursor-not-allowed")}
      >
        {label}
        {disabled && (
          <span className="ml-2 text-xs text-ink-muted">({soldOutLabel})</span>
        )}
      </Label>
      {priceDelta !== 0 && (
        <span className="nums text-sm font-medium text-ink-muted">
          {priceDelta > 0 ? "+" : "−"}
          <Price value={Math.abs(priceDelta)} size="sm" className="ml-0.5" />
        </span>
      )}
    </div>
  );
}
