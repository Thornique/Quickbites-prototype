"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useT } from "@/i18n";
import { formatDate, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/services/reports";

export type RangePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "custom";

/** Start of day / end of day, so a range always covers whole days. */
function dayStart(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dayEnd(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

/** The range a preset means, resolved against "now". */
export function resolvePreset(preset: Exclude<RangePreset, "custom">): DateRange {
  const now = new Date();

  switch (preset) {
    case "today":
      return { from: dayStart(now), to: dayEnd(now) };
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: dayStart(yesterday), to: dayEnd(yesterday) };
    }
    case "last7": {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from: dayStart(from), to: dayEnd(now) };
    }
    case "last30": {
      const from = new Date(now);
      from.setDate(from.getDate() - 29);
      return { from: dayStart(from), to: dayEnd(now) };
    }
    case "thisMonth": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: dayStart(from), to: dayEnd(now) };
    }
  }
}

export interface DateRangePickerProps {
  preset: RangePreset;
  range: DateRange;
  onChange: (preset: RangePreset, range: DateRange) => void;
  className?: string;
}

/**
 * Period control for the dashboard and reports.
 *
 * The presets cover what the cafe actually asks ("how did today go", "how was
 * the week"); Custom is two date inputs rather than a calendar widget, because
 * a native date input is faster to type into and already localised.
 */
export function DateRangePicker({
  preset,
  range,
  onChange,
  className,
}: DateRangePickerProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(toDateKey(range.from));
  const [customTo, setCustomTo] = useState(toDateKey(range.to));

  const presets: Array<{ value: Exclude<RangePreset, "custom">; label: string }> = [
    { value: "today", label: t.adm.range.today },
    { value: "yesterday", label: t.adm.range.yesterday },
    { value: "last7", label: t.adm.range.last7 },
    { value: "last30", label: t.adm.range.last30 },
    { value: "thisMonth", label: t.adm.range.thisMonth },
  ];

  const label =
    preset === "custom"
      ? `${formatDate(range.from)} – ${formatDate(range.to)}`
      : (presets.find((p) => p.value === preset)?.label ?? t.adm.range.custom);

  const applyCustom = () => {
    const from = dayStart(new Date(`${customFrom}T00:00:00`));
    const to = dayEnd(new Date(`${customTo}T00:00:00`));
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
    onChange("custom", from <= to ? { from, to } : { from: to, to: from });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <CalendarDays aria-hidden="true" />
          <span className="nums">{label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-3">
        <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
          {t.adm.range.label}
        </p>

        <div className="mt-2 grid gap-1">
          {presets.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value, resolvePreset(option.value));
                setIsOpen(false);
              }}
              aria-pressed={preset === option.value}
              className={cn(
                "rounded-control px-2.5 py-2 text-left text-sm font-medium transition-colors",
                preset === option.value
                  ? "bg-brand/8 text-brand"
                  : "text-ink hover:bg-sand-100",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-3 border-t border-hairline pt-3">
          <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
            {t.adm.range.custom}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor="range-from" className="text-xs">
                {t.adm.range.from}
              </Label>
              <Input
                id="range-from"
                type="date"
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
                className="h-9"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="range-to" className="text-xs">
                {t.adm.range.to}
              </Label>
              <Input
                id="range-to"
                type="date"
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
                className="h-9"
              />
            </div>
          </div>
          <Button size="sm" className="mt-3 w-full" onClick={applyCustom}>
            {t.adm.range.apply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
