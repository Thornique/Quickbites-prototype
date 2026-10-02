export const APP_ERROR_CODES = [
  "NOT_FOUND",
  "VALIDATION",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "CONFLICT",
  "PAYMENT_NOT_VERIFIED",
  "STORAGE_FULL",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

/**
 * The single error type every service throws. UI code matches on `code` to
 * decide between an inline field message, a toast and a 403 screen.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  /** Field name for VALIDATION errors, so forms can target the message. */
  readonly field?: string;

  constructor(code: AppErrorCode, message: string, field?: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.field = field;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Narrow an unknown caught value to a message safe to show the user. */
export function toErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (isAppError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export const notFound = (what: string) =>
  new AppError("NOT_FOUND", `${what} not found.`);
export const invalid = (message: string, field?: string) =>
  new AppError("VALIDATION", message, field);
export const forbidden = (message = "You do not have access to this.") =>
  new AppError("FORBIDDEN", message);
export const unauthorized = (message = "Please sign in to continue.") =>
  new AppError("UNAUTHORIZED", message);
export const conflict = (message: string) => new AppError("CONFLICT", message);
/** The money is not confirmed, so the kitchen must not act on the order. */
export const paymentNotVerified = (message: string) =>
  new AppError("PAYMENT_NOT_VERIFIED", message);
