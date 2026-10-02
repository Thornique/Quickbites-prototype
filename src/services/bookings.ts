import { conflict, invalid, notFound } from "@/lib/errors";
import { readCollection, readSingleton, writeCollection } from "@/storage";
import type { BookingStatus, StoreSettings, TableBooking, Weekday } from "@/types";
import { WEEKDAYS } from "@/types";
import {
  getCurrentUser,
  logActivity,
  newId,
  nowIso,
  ready,
  requirePermission,
} from "./common";

function settings(): StoreSettings {
  const stored = readSingleton<StoreSettings>("storeSettings");
  if (!stored) throw notFound("Store settings");
  return stored;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Bookable slots for a date, respecting opening hours and holidays. */
export async function listSlotsForDate(
  date: string,
): Promise<Array<{ time: string; remaining: number; isFull: boolean }>> {
  await ready(false);
  const config = settings();

  if (config.holidays.includes(date)) return [];

  const weekday = WEEKDAYS[new Date(`${date}T00:00:00`).getDay()] as Weekday;
  const hours = config.hours[weekday];
  if (hours.isClosed) return [];

  const bookings = readCollection<TableBooking>("bookings").filter(
    (b) => b.date === date && b.status !== "CANCELLED" && b.status !== "NO_SHOW",
  );

  const slots: Array<{ time: string; remaining: number; isFull: boolean }> = [];
  const open = toMinutes(hours.openTime);
  // Stop one slot before closing so a table is not booked at the last minute.
  const close = toMinutes(hours.closeTime) - config.bookingSlotMinutes;

  for (let t = open; t <= close; t += config.bookingSlotMinutes) {
    const time = toClock(t);
    const booked = bookings
      .filter((b) => b.time === time)
      .reduce((sum, b) => sum + b.partySize, 0);
    const remaining = Math.max(0, config.maxCoversPerSlot - booked);
    slots.push({ time, remaining, isFull: remaining <= 0 });
  }
  return slots;
}

export interface CreateBookingInput {
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  specialRequest?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<TableBooking> {
  await ready();
  const config = settings();

  if (input.partySize < 1 || input.partySize > 12) {
    throw invalid("Party size must be between 1 and 12.", "partySize");
  }

  const slots = await listSlotsForDate(input.date);
  const slot = slots.find((s) => s.time === input.time);
  if (!slot) throw invalid("That time is not available on the chosen date.", "time");
  if (slot.remaining < input.partySize) {
    throw conflict(
      `Only ${slot.remaining} seat${slot.remaining === 1 ? "" : "s"} left at ${input.time}. Try another slot.`,
    );
  }
  if (config.maxCoversPerSlot <= 0)
    throw conflict("Table bookings are currently closed.");

  const booking: TableBooking = {
    id: newId("bkg"),
    customerId: getCurrentUser()?.id,
    name: input.name.trim(),
    phone: input.phone.trim(),
    date: input.date,
    time: input.time,
    partySize: input.partySize,
    specialRequest: input.specialRequest?.trim() || undefined,
    status: "PENDING",
    createdAt: nowIso(),
  };

  const rows = readCollection<TableBooking>("bookings");
  writeCollection("bookings", [booking, ...rows], "create", booking.id);
  return booking;
}

export async function listBookings(
  filters: {
    status?: BookingStatus;
    date?: string;
  } = {},
): Promise<TableBooking[]> {
  await ready();
  requirePermission("BOOKINGS");
  return readCollection<TableBooking>("bookings")
    .filter((b) => (filters.status ? b.status === filters.status : true))
    .filter((b) => (filters.date ? b.date === filters.date : true))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

/** The signed-in customer's own bookings, shown in /account. */
export async function listMyBookings(): Promise<TableBooking[]> {
  await ready();
  const user = getCurrentUser();
  if (!user) return [];
  return readCollection<TableBooking>("bookings")
    .filter((b) => b.customerId === user.id)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  statusMessage?: string,
): Promise<TableBooking> {
  await ready();
  const admin = requirePermission("BOOKINGS");
  const rows = readCollection<TableBooking>("bookings");
  const existing = rows.find((b) => b.id === id);
  if (!existing) throw notFound("Booking");

  const next: TableBooking = {
    ...existing,
    status,
    statusMessage: statusMessage?.trim() || existing.statusMessage,
    updatedAt: nowIso(),
  };
  writeCollection(
    "bookings",
    rows.map((b) => (b.id === id ? next : b)),
    "update",
    id,
  );
  logActivity(admin, "BOOKING_STATUS", `Booking for ${existing.name} → ${status}`, id);
  return next;
}

export async function countPendingBookings(): Promise<number> {
  await ready(false);
  return readCollection<TableBooking>("bookings").filter((b) => b.status === "PENDING")
    .length;
}
