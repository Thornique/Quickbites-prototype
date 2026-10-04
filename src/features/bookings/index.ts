"use client";

import {
  countPendingBookings,
  listBookings,
  listMyBookings,
  listSlotsForDate,
} from "@/services/bookings";
import type { BookingStatus, OutletId } from "@/types";
import { useStoreQuery } from "../use-store-query";

export function useBookings(
  filters: { outletId?: OutletId; status?: BookingStatus; date?: string } = {},
) {
  const key = JSON.stringify(filters);
  return useStoreQuery(() => listBookings(filters), ["bookings"], [key]);
}

export function useMyBookings() {
  return useStoreQuery(listMyBookings, ["bookings"]);
}

/** Slot availability for the booking form's date picker. */
export function useBookingSlots(outletId: OutletId, date: string) {
  return useStoreQuery(
    () => listSlotsForDate(outletId, date),
    ["bookings", "storeSettings"],
    [outletId, date],
  );
}

export function usePendingBookingCount(outletId?: OutletId) {
  return useStoreQuery(() => countPendingBookings(outletId), ["bookings"], [outletId]);
}
