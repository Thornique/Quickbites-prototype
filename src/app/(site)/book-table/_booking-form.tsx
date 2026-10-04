"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth";
import { useBookingSlots } from "@/features/bookings";
import { OutletBadge, useOutlet } from "@/features/outlet";
import { usePick, useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatSlotLabel, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import { bookingSchema, type BookingValues } from "@/lib/validation";
import { createBooking } from "@/services/bookings";
import type { TableBooking } from "@/types";

/** The next 14 days, as {key, label} for the date rail. */
function useDays(): Array<{ key: string; weekday: string; day: string }> {
  return useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return {
        key: toDateKey(date),
        weekday: date.toLocaleDateString("en-IN", { weekday: "short" }),
        day: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      };
    });
  }, []);
}

export function BookingForm() {
  const t = useT();
  const { user } = useSession();
  const pick = usePick();
  const { outletId, outlet } = useOutlet();
  const days = useDays();
  const [date, setDate] = useState(days[0].key);
  const [booked, setBooked] = useState<TableBooking | null>(null);

  const { data: slots, isLoading: isSlotsLoading } = useBookingSlots(outletId, date);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema(t)),
    defaultValues: {
      name: "",
      phone: "",
      date: days[0].key,
      time: "",
      partySize: 2,
      specialRequest: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    setValue("name", user.name);
    setValue("phone", user.phone);
  }, [user, setValue]);

  // The chosen slot belongs to the chosen date, so changing the day clears it.
  useEffect(() => {
    setValue("date", date);
    setValue("time", "");
  }, [date, setValue]);

  const time = watch("time");
  const partySize = watch("partySize");

  const onSubmit = handleSubmit(async (values) => {
    try {
      const booking = await createBooking({
        outletId,
        name: values.name,
        phone: values.phone,
        date: values.date,
        time: values.time,
        partySize: Number(values.partySize),
        specialRequest: values.specialRequest,
      });
      setBooked(booking);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    }
  });

  if (booked) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-veg/10 text-veg-dark">
            <CheckCircle2 size={26} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="text-display mt-4 text-2xl text-ink uppercase">
            {t.booking.confirmedTitle}
          </p>
          <p className="measure mt-2 text-sm text-ink-muted">
            {t.booking.confirmedBody}
          </p>

          <div className="mt-6 w-full rounded-card border border-hairline bg-sand-100 p-4 text-left">
            <p className="text-xs font-bold tracking-[0.12em] text-ink-muted uppercase">
              {t.booking.bookingId}
            </p>
            <p className="nums text-display mt-1 text-xl text-brand">{booked.id}</p>
            <p className="nums mt-3 text-sm text-ink">
              {booked.date} · {formatSlotLabel(booked.time)} ·{" "}
              {t.booking.people(booked.partySize)}
            </p>
            <Badge variant="warning" className="mt-3">
              {t.booking.status[booked.status]}
            </Badge>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setBooked(null);
                reset({
                  name: user?.name ?? "",
                  phone: user?.phone ?? "",
                  date,
                  time: "",
                  partySize: 2,
                  specialRequest: "",
                });
              }}
            >
              {t.booking.bookAnother}
            </Button>
            {user && (
              <Button asChild>
                <Link href="/account">{t.booking.myBookings}</Link>
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        {/*
          Which shop the table is at. Both take bookings, and the switch that
          decides it is up in the header — so say it here rather than let
          somebody book the wrong room.
        */}
        <p className="flex flex-wrap items-center gap-2 rounded-control border border-hairline bg-sand-50 px-3 py-2 text-sm text-ink">
          <OutletBadge outletId={outletId} />
          <span className="min-w-0">{pick(outlet.address)}</span>
        </p>

        {/* Date rail */}
        <div className="grid gap-1.5">
          <Label>{t.booking.date}</Label>
          <div
            role="radiogroup"
            aria-label={t.booking.date}
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          >
            {days.map((day, index) => {
              const isActive = day.key === date;
              return (
                <button
                  key={day.key}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setDate(day.key)}
                  className={cn(
                    "shrink-0 rounded-control border px-3 py-2 text-center transition-colors",
                    isActive
                      ? "border-brand bg-brand text-white"
                      : "border-hairline bg-surface text-ink hover:border-ink-muted",
                  )}
                >
                  <span className="block text-xs font-semibold">
                    {index === 0
                      ? t.booking.today
                      : index === 1
                        ? t.booking.tomorrow
                        : day.weekday}
                  </span>
                  <span className="nums mt-0.5 block text-xs opacity-80">
                    {day.day}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slots */}
        <div className="grid gap-1.5">
          <Label>{t.booking.time}</Label>

          {isSlotsLoading && (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-24 rounded-control" />
              ))}
            </div>
          )}

          {!isSlotsLoading && (slots ?? []).length === 0 && (
            <div className="rounded-card border border-dashed border-hairline px-4 py-6 text-center">
              <p className="text-sm font-semibold text-ink">{t.booking.noSlots}</p>
              <p className="mt-1 text-sm text-ink-muted">{t.booking.noSlotsBody}</p>
            </div>
          )}

          {!isSlotsLoading && (slots ?? []).length > 0 && (
            <div
              role="radiogroup"
              aria-label={t.booking.time}
              className="flex flex-wrap gap-2"
            >
              {(slots ?? []).map((slot) => {
                const isActive = slot.time === time;
                const isTooSmall = slot.remaining < Number(partySize);
                const isDisabled = slot.isFull || isTooSmall;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    disabled={isDisabled}
                    onClick={() => setValue("time", slot.time)}
                    className={cn(
                      "rounded-control border px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "border-brand bg-brand text-white"
                        : "border-hairline bg-surface text-ink hover:border-ink-muted",
                      isDisabled &&
                        "cursor-not-allowed border-hairline bg-sand-100 text-ink-muted/60 hover:border-hairline",
                    )}
                  >
                    <span className="nums font-semibold">
                      {formatSlotLabel(slot.time)}
                    </span>
                    <span className="nums ml-1.5 text-xs opacity-75">
                      {slot.isFull
                        ? t.booking.full
                        : t.booking.seatsLeft(slot.remaining)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {errors.time?.message && (
            <p role="alert" className="text-xs font-medium text-danger">
              {errors.time.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="bk-size" label={t.booking.partySize}>
            <Select
              value={String(partySize)}
              onValueChange={(value) => setValue("partySize", Number(value))}
            >
              <SelectTrigger id="bk-size" aria-label={t.booking.partySize}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    {t.booking.people(count)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="bk-name" label={t.booking.name} error={errors.name?.message}>
            <Input
              {...fieldAria("bk-name", errors.name?.message)}
              {...register("name")}
              autoComplete="name"
            />
          </FormField>
        </div>

        <FormField id="bk-phone" label={t.booking.phone} error={errors.phone?.message}>
          <Input
            {...fieldAria("bk-phone", errors.phone?.message)}
            {...register("phone")}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel-national"
          />
        </FormField>

        <FormField id="bk-request" label={t.booking.request}>
          <Textarea
            {...fieldAria("bk-request")}
            {...register("specialRequest")}
            rows={3}
            maxLength={200}
            placeholder={t.booking.requestPlaceholder}
          />
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="justify-self-start">
          <CalendarCheck aria-hidden="true" />
          {t.booking.submit}
        </Button>
      </form>
    </Card>
  );
}
