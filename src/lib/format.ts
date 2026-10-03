import { format as formatDateFns } from "date-fns";
import { hi as hiLocale } from "date-fns/locale/hi";
import { formatInTimeZone } from "date-fns-tz";
import { CURRENCY, TIME_ZONE, type Locale } from "@/lib/constants";

type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

/**
 * Price in Indian rupees, e.g. 1249 -> "₹1,249".
 * Paise are dropped unless the amount actually has them, because the menu
 * is priced in whole rupees and "₹99.00" reads like a foreign site.
 */
export function formatPrice(amount: number): string {
  const hasPaise = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: hasPaise ? 2 : 0,
  }).format(amount);
}

/** Bare number with Indian grouping and no symbol, e.g. 125000 -> "1,25,000". */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(CURRENCY.locale).format(value);
}

/** "2 Oct 2026" in Asia/Kolkata. */
export function formatDate(value: DateInput): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, "d MMM yyyy");
}

/** "7:42 PM" in Asia/Kolkata. */
export function formatTime(value: DateInput): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, "h:mm a");
}

/** "2 Oct 2026, 7:42 PM" in Asia/Kolkata. */
export function formatDateTime(value: DateInput): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, "d MMM yyyy, h:mm a");
}

/** Short weekday + time, for order boards: "Thu 7:42 PM". */
export function formatDayTime(value: DateInput): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, "EEE h:mm a");
}

/**
 * "Friday, 3 October" in Asia/Kolkata — the dashboard greeting line.
 *
 * The only date in the app that is spoken inside a sentence, so it is also the
 * only one that takes the UI language: an English weekday in the middle of a
 * Hindi greeting reads as a half-translated screen.
 */
export function formatLongDate(value: DateInput, locale: Locale = "en"): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, "EEEE, d MMMM", {
    locale: locale === "hi" ? hiLocale : undefined,
  });
}

/** Hour of day 0-23 in Asia/Kolkata, so a greeting matches the cafe's clock. */
export function hourOfDay(value: DateInput): number {
  return Number(formatInTimeZone(toDate(value), TIME_ZONE, "H"));
}

/** ISO date key (yyyy-MM-dd) in Asia/Kolkata — safe for grouping reports. */
export function toDateKey(value: DateInput): string {
  return formatInTimeZone(toDate(value), TIME_ZONE, "yyyy-MM-dd");
}

/**
 * Compact relative duration used on the kitchen board and tracking page.
 * Always phrased from whole minutes: "just now", "9 min", "1 hr 5 min".
 */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes === 0) return "just now";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

/** Whole minutes between now (or `from`) and `to`; negative when overdue. */
export function minutesUntil(to: DateInput, from: DateInput = new Date()): number {
  const ms = toDate(to).getTime() - toDate(from).getTime();
  return Math.round(ms / 60000);
}

/** Percentage with no decimals, e.g. 0.0734 -> "7%". */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** Local-time clock label for a "HH:mm" slot string, e.g. "19:30" -> "7:30 PM". */
export function formatSlotLabel(slot: string): string {
  const [hours, minutes] = slot.split(":").map(Number);
  const base = new Date(2000, 0, 1, hours, minutes);
  return formatDateFns(base, "h:mm a");
}

/**
 * Admins type phone numbers as display text ("+91 98765 43210"), but a tel:
 * href needs them without spaces. Falls back to the static store number when
 * the content record has nothing useful in it.
 */
export function telHref(phone: string | undefined, fallback: string): string {
  const cleaned = (phone ?? "").replace(/[^\d+]/g, "");
  return cleaned.length >= 6 ? cleaned : fallback;
}
