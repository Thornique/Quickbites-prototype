import type { ClockTime, IsoDate, IsoDateTime, Timestamped } from "./common";
import type { OutletScoped } from "./outlet";

export const ENQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "CLOSED"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

/** Matches the service cards on /services so the form can be prefilled. */
export const ENQUIRY_SUBJECTS = [
  "PARTY_ORDER",
  "BULK_ORDER",
  "CATERING",
  "CORPORATE_LUNCH",
  "FEEDBACK",
  "OTHER",
] as const;
export type EnquirySubject = (typeof ENQUIRY_SUBJECTS)[number];

export interface Enquiry extends Timestamped, OutletScoped {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: EnquirySubject;
  message: string;
  status: EnquiryStatus;
  /** Admin-only notes, not visible to the customer. */
  internalNotes?: string;
  handledByUserId?: string;
}

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SEATED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface TableBooking extends Timestamped, OutletScoped {
  id: string;
  /** Set when a signed-in customer booked, so it appears in their account. */
  customerId?: string;
  name: string;
  phone: string;
  date: IsoDate;
  time: ClockTime;
  partySize: number;
  specialRequest?: string;
  status: BookingStatus;
  /** Message shown to the customer when confirming or cancelling. */
  statusMessage?: string;
}

export interface Review extends Timestamped, OutletScoped {
  id: string;
  customerId: string;
  customerName: string;
  /** Present when the review was left against a specific order. */
  orderId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  isApproved: boolean;
  /** Owner's public response, rendered under the review on /reviews. */
  reply?: string;
  repliedAt?: IsoDateTime;
}
