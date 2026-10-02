import type { CartLine } from "./cart";
import type { IsoDateTime, Timestamped } from "./common";

export const ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** The kitchen board columns, in the order work actually flows. */
export const ACTIVE_ORDER_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
] as const satisfies readonly OrderStatus[];

export const PAYMENT_METHODS = ["UPI", "CARD", "COUNTER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "PAID",
  "PAY_AT_COUNTER",
  "FAILED",
  "REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** One transition in an order's life, with who made it. */
export interface OrderStatusEvent {
  status: OrderStatus;
  at: IsoDateTime;
  /** User id of the admin who made the change; undefined for the customer. */
  byUserId?: string;
  byName?: string;
  /** Required when status is CANCELLED. */
  reason?: string;
}

/** A cart line frozen at the moment the order was placed. */
export interface OrderLine extends CartLine {
  unitTotal: number;
  lineTotal: number;
}

export interface Order extends Timestamped {
  /** Human-facing order number, e.g. "QB-1042". Also the primary key. */
  id: string;
  customerId: string;
  lines: OrderLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  packagingCharge: number;
  /** GST percentage applied, snapshotted so historic orders stay correct. */
  taxRate: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  estimatedReadyAt: IsoDateTime;
  /** Set when the customer chose a scheduled pickup slot instead of ASAP. */
  scheduledFor?: IsoDateTime;
  pickupName: string;
  phone: string;
  notes?: string;
  /** True once stock has been deducted, so Accept is never applied twice. */
  stockDeducted: boolean;
}

/** Filters used by both the admin order table and the customer history. */
export interface OrderFilters {
  status?: OrderStatus | "ACTIVE" | "ALL";
  customerId?: string;
  from?: IsoDateTime;
  to?: IsoDateTime;
  paymentMethod?: PaymentMethod;
  /** Matches order id, pickup name or phone. */
  search?: string;
}
