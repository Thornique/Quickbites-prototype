import { toDateKey } from "@/lib/format";
import { readCollection } from "@/storage";
import type { Order, OutletId, StoreSettings, Weekday } from "@/types";
import { WEEKDAYS } from "@/types";

/**
 * Scheduled-takeaway slots.
 *
 * Fifteen-minute slots inside opening hours for today and tomorrow, honouring
 * a minimum lead time and a per-slot capacity so the kitchen cannot be handed
 * twenty orders for 7:30 PM.
 */

export const SLOT_MINUTES = 15;

export interface ScheduleSlot {
  /** ISO timestamp of the slot start. */
  at: string;
  /** "19:30", for display and grouping. */
  time: string;
  booked: number;
  remaining: number;
  isAvailable: boolean;
  reason?: "PAST" | "TOO_SOON" | "FULL" | "CLOSED";
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function slotsBookedOn(orders: Order[], iso: string): number {
  return orders.filter(
    (order) =>
      order.isScheduled && order.scheduledFor === iso && order.status !== "CANCELLED",
  ).length;
}

/**
 * Slots for one date. Past and too-soon slots are returned but marked
 * unavailable, so the UI can show them disabled with a reason rather than
 * silently hiding half the day.
 *
 * `orders` must already be narrowed to the outlet being booked — capacity is
 * one counter's capacity, and coffee slots do not fill the kitchen's.
 */
export function buildSlotsForDate(
  date: Date,
  settings: Pick<
    StoreSettings,
    "hours" | "holidays" | "scheduleMinLeadMinutes" | "maxOrdersPerSlot"
  >,
  orders: Order[],
  now = new Date(),
): ScheduleSlot[] {
  const dateKey = toDateKey(date);
  const weekday = WEEKDAYS[date.getDay()] as Weekday;
  const hours = settings.hours[weekday];

  if (settings.holidays.includes(dateKey) || hours.isClosed) return [];

  const earliest = now.getTime() + settings.scheduleMinLeadMinutes * 60_000;
  const open = toMinutes(hours.openTime);
  // Stop one slot short of closing so the kitchen is not still cooking at close.
  const close = toMinutes(hours.closeTime) - SLOT_MINUTES;

  const slots: ScheduleSlot[] = [];
  for (let minute = open; minute <= close; minute += SLOT_MINUTES) {
    const at = new Date(date);
    at.setHours(Math.floor(minute / 60), minute % 60, 0, 0);
    const iso = at.toISOString();

    const booked = slotsBookedOn(orders, iso);
    const remaining = Math.max(0, settings.maxOrdersPerSlot - booked);

    let reason: ScheduleSlot["reason"];
    if (at.getTime() <= now.getTime()) reason = "PAST";
    else if (at.getTime() < earliest) reason = "TOO_SOON";
    else if (remaining <= 0) reason = "FULL";

    slots.push({
      at: iso,
      time: `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`,
      booked,
      remaining,
      isAvailable: !reason,
      reason,
    });
  }
  return slots;
}

/** Today and tomorrow, which is as far ahead as scheduling is offered. */
export function buildSchedulableDays(
  settings: Pick<
    StoreSettings,
    "hours" | "holidays" | "scheduleMinLeadMinutes" | "maxOrdersPerSlot"
  >,
  outletId: OutletId,
  now = new Date(),
): Array<{ date: string; slots: ScheduleSlot[] }> {
  const orders = readCollection<Order>("orders").filter(
    (order) => order.outletId === outletId,
  );
  const days: Array<{ date: string; slots: ScheduleSlot[] }> = [];

  for (const offset of [0, 1]) {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    days.push({
      date: toDateKey(date),
      slots: buildSlotsForDate(date, settings, orders, now),
    });
  }
  return days;
}

/** Validates a slot the customer picked, against live capacity. */
export function checkSlot(
  scheduledFor: string,
  settings: Pick<
    StoreSettings,
    "hours" | "holidays" | "scheduleMinLeadMinutes" | "maxOrdersPerSlot"
  >,
  orders: Order[],
  now = new Date(),
): { ok: boolean; reason?: string } {
  const at = new Date(scheduledFor);
  if (Number.isNaN(at.getTime())) {
    return { ok: false, reason: "That pickup time is not valid." };
  }

  const slots = buildSlotsForDate(at, settings, orders, now);
  const slot = slots.find((s) => s.at === at.toISOString());

  if (!slot) return { ok: false, reason: "We're not open at that time." };
  if (slot.reason === "PAST" || slot.reason === "TOO_SOON") {
    return {
      ok: false,
      reason: `Please choose a slot at least ${settings.scheduleMinLeadMinutes} minutes from now.`,
    };
  }
  if (slot.reason === "FULL") {
    return { ok: false, reason: "That slot is full. Please pick another time." };
  }
  return { ok: true };
}
