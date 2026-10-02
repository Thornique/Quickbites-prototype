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

  /**
   * A takeaway order whose payment the cafe rejected auto-cancels this many
   * minutes later if the customer has not paid again.
   */
  unpaidTakeawayTimeoutMinutes: number;
  /**
   * When true, a dine-in cash order cannot move to PREPARING until the cash
   * has actually been taken. Off by default — the customer is sitting there.
   */
  requirePaymentBeforePrepForCash: boolean;

  /** Scheduled takeaway: earliest slot is this many minutes from now. */
  scheduleMinLeadMinutes: number;
  /** Scheduled takeaway: how many orders one 15-minute slot can hold. */
  maxOrdersPerSlot: number;
  /** Customers may cancel a scheduled order until this long before the slot. */
  scheduleCancelCutoffMinutes: number;

  /** Plays a sound in the admin panel when a new order arrives. */
  notificationSound: boolean;
}
