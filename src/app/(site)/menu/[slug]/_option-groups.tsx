"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePick, useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { MenuItem, OptionGroup } from "@/types";

export interface OptionGroupsProps {
  item: MenuItem;
  selected: string[];
  onChange: (next: string[]) => void;
  onError: (message: string | null) => void;
}

/**
 * Option groups for the item detail page. The customise sheet renders the
 * same model in its own compact layout; both feed the identical option-id
 * list into buildCartLine, which is what actually validates the choices.
 */
export function OptionGroups({ item, selected, onChange, onError }: OptionGroupsProps) {
  const t = useT();
  const pick = usePick();

  if (item.optionGroups.length === 0) return null;

  const toggle = (group: OptionGroup, optionId: string, checked: boolean) => {
    onError(null);
    const groupIds = new Set(group.options.map((option) => option.id));
    const others = selected.filter((id) => !groupIds.has(id));
    const mine = selected.filter((id) => groupIds.has(id));

    if (group.type === "single") {
      onChange(checked ? [...others, optionId] : others);
      return;
    }
    if (!checked) {
      onChange([...others, ...mine.filter((id) => id !== optionId)]);
      return;
    }
    if (mine.length >= group.maxSelect) {
      onError(t.customise.maxReached(group.maxSelect));
      return;
    }
    onChange([...others, ...mine, optionId]);
  };

  return (
    <div className="grid gap-6">
      {item.optionGroups.map((group) => {
        const chosen = selected.filter((id) =>
          group.options.some((option) => option.id === id),
        );

        return (
          <fieldset key={group.id} className="rounded-card border border-hairline p-4">
            <legend className="flex items-baseline gap-2 px-1.5">
              <span className="text-sm font-semibold text-ink">{pick(group.name)}</span>
              {group.isRequired && (
                <span className="text-xs font-semibold text-brand">
                  {t.customise.required}
                </span>
              )}
              <span className="text-xs text-ink-muted">
                {group.type === "single"
                  ? t.customise.chooseOne
                  : t.customise.chooseUpTo(group.maxSelect)}
              </span>
            </legend>

            {group.type === "single" ? (
              <RadioGroup
                value={chosen[0] ?? ""}
                onValueChange={(value) => toggle(group, value, true)}
                className="mt-1 gap-0"
              >
                {group.options.map((option) => (
                  <Row
                    key={option.id}
                    id={`d-${option.id}`}
                    label={pick(option.name)}
                    priceDelta={option.priceDelta}
                    disabled={!option.isAvailable}
                    soldOutLabel={t.customise.soldOutOption}
                    control={
                      <RadioGroupItem
                        value={option.id}
                        id={`d-${option.id}`}
                        disabled={!option.isAvailable}
                      />
                    }
                  />
                ))}
              </RadioGroup>
            ) : (
              <div className="mt-1">
                {group.options.map((option) => (
                  <Row
                    key={option.id}
                    id={`d-${option.id}`}
                    label={pick(option.name)}
                    priceDelta={option.priceDelta}
                    disabled={!option.isAvailable}
                    soldOutLabel={t.customise.soldOutOption}
                    control={
                      <Checkbox
                        id={`d-${option.id}`}
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
    </div>
  );
}

function Row({
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
        "flex items-center gap-3 border-b border-hairline py-2.5 last:border-0",
        disabled && "opacity-50",
      )}
    >
      {control}
      <Label htmlFor={id} className="flex-1 font-normal">
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
