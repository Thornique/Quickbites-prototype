import { z } from "zod";
import type { Dictionary } from "@/i18n";

/**
 * Schemas are built from the active dictionary rather than holding hard-coded
 * English, so a validation message appears in the same language as the form
 * around it.
 */

/** Indian mobile numbers are 10 digits starting 6–9. */
const PHONE_PATTERN = /^[6-9]\d{9}$/;

export function emailField(t: Dictionary) {
  return z
    .string()
    .trim()
    .min(1, t.validation.emailRequired)
    .email(t.validation.emailInvalid);
}

export function phoneField(t: Dictionary) {
  return z
    .string()
    .trim()
    .min(1, t.validation.phoneRequired)
    .regex(PHONE_PATTERN, t.validation.phoneInvalid);
}

export function nameField(t: Dictionary) {
  return z
    .string()
    .trim()
    .min(1, t.validation.nameRequired)
    .min(2, t.validation.nameTooShort);
}

/** At least 8 characters and at least one digit, per the brief. */
export function passwordField(t: Dictionary) {
  return z
    .string()
    .min(1, t.validation.passwordRequired)
    .min(8, t.validation.passwordTooShort)
    .regex(/\d/, t.validation.passwordNeedsNumber);
}

export function signInSchema(t: Dictionary) {
  return z.object({
    email: emailField(t),
    // Deliberately not the full password rules: an existing account may
    // predate them, and the error belongs on the submit, not the field.
    password: z.string().min(1, t.validation.passwordRequired),
  });
}

export function signUpSchema(t: Dictionary) {
  return z
    .object({
      name: nameField(t),
      email: emailField(t),
      phone: phoneField(t),
      password: passwordField(t),
      confirmPassword: z.string().min(1, t.validation.confirmRequired),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t.validation.passwordsDoNotMatch,
      path: ["confirmPassword"],
    });
}

export type SignInValues = z.infer<ReturnType<typeof signInSchema>>;
export type SignUpValues = z.infer<ReturnType<typeof signUpSchema>>;
