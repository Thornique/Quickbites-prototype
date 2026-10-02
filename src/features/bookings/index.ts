"use client";

import {
  countPendingBookings,
  listBookings,
  listMyBookings,
  listSlotsForDate,
} from "@/services/bookings";
import type { BookingStatus } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useBookings(filters: { status?: BookingStatus; date?: string } = {}) {
  const key = JSON.stringify(filters);
  return useStoreQuery(() => listBookings(filters), ["bookings"], [key]);
}

export function useMyBookings() {
  return useStoreQuery(listMyBookings, ["bookings"]);
}

/** Slot availability for the booking form's date picker. */
export function useBookingSlots(date: string) {
  return useStoreQuery(
    () => listSlotsForDate(date),
    ["bookings", "storeSettings"],
    [date],
  );
}

export function usePendingBookingCount() {
  return useStoreQuery(countPendingBookings, ["bookings"]);
}
