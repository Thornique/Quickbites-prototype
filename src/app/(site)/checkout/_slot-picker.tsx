"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOutletId } from "@/features/outlet";
import { useT } from "@/i18n";
import { formatSlotLabel } from "@/lib/format";
import { getSchedulableDays, type ScheduleSlot } from "@/services/orders";
import { cn } from "@/lib/utils";

/**
 * ASAP or a scheduled slot. Unavailable slots are shown disabled with their
 * reason rather than hidden, so the customer can see the evening filling up
 * instead of wondering where the times went.
 */
export function SlotPicker({
  value,
  onChange,
  asapHint,
  className,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  asapHint: string;
  className?: string;
}) {
  const t = useT();
  const outletId = useOutletId();
  const [days, setDays] = useState<Array<{ date: string; slots: ScheduleSlot[] }>>([]);
  const [dayIndex, setDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getSchedulableDays(outletId).then((result) => {
      setDays(result);
      setIsLoading(false);
    });
  }, [outletId]);

  const reasonLabel = (slot: ScheduleSlot) => {
    switch (slot.reason) {
      case "FULL":
        return t.checkout.slotFull;
      case "PAST":
        return t.checkout.slotPast;
      case "TOO_SOON":
        return t.checkout.slotTooSoon;
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <div className="grid gap-2">
        {(
          [
            {
              id: "asap",
              label: t.checkout.asap,
              hint: asapHint,
              active: value === null,
            },
            {
              id: "later",
              label: t.checkout.schedule,
              hint: "",
              active: value !== null,
            },
          ] as const
        ).map((option) => (
          <label
            key={option.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-control border p-3.5 transition-colors",
              "focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2",
              option.active
                ? "border-brand bg-brand/5"
                : "border-hairline hover:border-ink/20",
            )}
          >
            <input
              type="radio"
              name="when"
              checked={option.active}
              onChange={() => {
                if (option.id === "asap") onChange(null);
                else {
                  const first = days[dayIndex]?.slots.find((slot) => slot.isAvailable);
                  onChange(first ? first.at : null);
                }
              }}
              className="sr-only"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">
                {option.label}
              </span>
              {option.hint && (
                <span className="mt-0.5 block text-xs text-ink-muted">
                  {option.hint}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      {value !== null && (
        <div className="mt-4">
          <div className="flex gap-2">
            {days.map((day, index) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setDayIndex(index)}
                className={cn(
                  "rounded-pill border px-3 py-1.5 text-sm font-semibold transition-colors",
                  index === dayIndex
                    ? "border-ink bg-ink text-white"
                    : "border-hairline text-ink-muted hover:text-ink",
                )}
              >
                {index === 0 ? t.checkout.today : t.checkout.tomorrow}
              </button>
            ))}
          </div>

          {isLoading && <Skeleton className="mt-3 h-24 w-full" />}

          {!isLoading && (days[dayIndex]?.slots.length ?? 0) === 0 && (
            <p className="mt-3 text-sm text-ink-muted">{t.checkout.noSlots}</p>
          )}

          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {days[dayIndex]?.slots.map((slot) => {
              const reason = reasonLabel(slot);
              const isSelected = value === slot.at;
              return (
                <li key={slot.at}>
                  <button
                    type="button"
                    disabled={!slot.isAvailable}
                    onClick={() => onChange(slot.at)}
                    className={cn(
                      "nums w-full rounded-control border px-2 py-2 text-sm font-semibold transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                      isSelected && "border-brand bg-brand text-white",
                      !isSelected &&
                        slot.isAvailable &&
                        "border-hairline text-ink hover:border-brand",
                      !slot.isAvailable &&
                        "cursor-not-allowed border-hairline bg-sand-50 text-ink-muted/60",
                    )}
                  >
                    {formatSlotLabel(slot.time)}
                    {reason && (
                      <span className="block text-[0.625rem] font-normal">
                        {reason}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
