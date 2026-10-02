import { z } from "zod";
import type { Dictionary } from "@/i18n";
import { ENQUIRY_SUBJECTS } from "@/types";

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

export function enquirySchema(t: Dictionary) {
  return z.object({
    name: nameField(t),
    phone: phoneField(t),
    email: emailField(t),
    subject: z.enum(ENQUIRY_SUBJECTS),
    message: z.string().trim().min(5, t.validation.messageRequired).max(600),
  });
}

export function bookingSchema(t: Dictionary) {
  return z.object({
    name: nameField(t),
    phone: phoneField(t),
    date: z.string().min(1),
    time: z.string().min(1, t.validation.slotRequired),
    partySize: z.number().int().min(1).max(12),
    specialRequest: z.string().trim().max(200).optional(),
  });
}

export type SignInValues = z.infer<ReturnType<typeof signInSchema>>;
export type SignUpValues = z.infer<ReturnType<typeof signUpSchema>>;
export type EnquiryValues = z.infer<ReturnType<typeof enquirySchema>>;
export type BookingValues = z.infer<ReturnType<typeof bookingSchema>>;
