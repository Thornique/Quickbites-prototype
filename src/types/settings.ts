import type { ClockTime, IsoDate, Timestamped } from "./common";

export const WEEKDAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface DayHours {
  isClosed: boolean;
  openTime: ClockTime;
  closeTime: ClockTime;
}

export interface StoreSettings extends Timestamped {
  id: "store-settings";
  /** Manual master switch; the computed open state also respects the hours. */
  isOpen: boolean;
  /** Pauses new orders while the store stays open for walk-ins. */
  acceptingOrders: boolean;
  hours: Record<Weekday, DayHours>;
  /** Dates the store is shut regardless of the weekly hours. */
  holidays: IsoDate[];

  /** Ready-by estimate: base buffer added to the slowest item's prep time. */
  basePrepBufferMinutes: number;
  /** Extra minutes added per order already in the kitchen. */
  perActiveOrderMinutes: number;

  /** GST percentage, e.g. 5. */
  taxRate: number;
  packagingCharge: number;

  /** Table booking configuration. */
  bookingSlotMinutes: number;
  maxCoversPerSlot: number;

  /** Plays a sound in the admin panel when a new order arrives. */
  notificationSound: boolean;
}
