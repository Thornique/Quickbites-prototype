/**
 * Card input helpers for the simulated payment screen.
 *
 * These exist to make the prototype behave like a real checkout — grouped
 * digits, a Luhn check, an expiry that must be in the future. No card data is
 * stored or sent anywhere; the values live in component state and are
 * discarded when the page unmounts.
 */

/** Groups digits in fours, capped at 19 digits. */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** Keeps the MM/YY shape as the customer types. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Standard Luhn checksum — what a real gateway rejects client-side. */
export function luhnValid(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 12) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** MM/YY in the future, with a plausible month. */
export function expiryValid(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  // Valid through the last day of the stated month.
  const expiresAt = new Date(year, month, 0, 23, 59, 59);
  return expiresAt.getTime() > now.getTime();
}
