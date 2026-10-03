import { invalid, notFound } from "@/lib/errors";
import { readCollection, writeCollection } from "@/storage";
import type { Enquiry, EnquiryStatus, EnquirySubject } from "@/types";
import { notifyAdmins } from "./notifications";
import { logActivity, newId, nowIso, ready, requirePermission } from "./common";

export interface CreateEnquiryInput {
  name: string;
  phone: string;
  email: string;
  subject: EnquirySubject;
  message: string;
}

/** Public — anyone can send an enquiry from /contact or /services. */
export async function createEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
  await ready();
  if (!input.message.trim()) throw invalid("Please write a message.", "message");

  const enquiry: Enquiry = {
    id: newId("enq"),
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject,
    message: input.message.trim(),
    status: "NEW",
    createdAt: nowIso(),
  };

  const rows = readCollection<Enquiry>("enquiries");
  writeCollection("enquiries", [enquiry, ...rows], "create", enquiry.id);
  notifyAdmins("ENQUIRIES", {
    type: "NEW_ENQUIRY",
    params: { name: enquiry.name },
    link: "/admin/enquiries",
    dedupeKey: `enquiry:${enquiry.id}`,
  });
  return enquiry;
}

export async function listEnquiries(status?: EnquiryStatus): Promise<Enquiry[]> {
  await ready();
  requirePermission("ENQUIRIES");
  return readCollection<Enquiry>("enquiries")
    .filter((e) => !status || e.status === status)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getEnquiry(id: string): Promise<Enquiry> {
  await ready();
  requirePermission("ENQUIRIES");
  const enquiry = readCollection<Enquiry>("enquiries").find((e) => e.id === id);
  if (!enquiry) throw notFound("Enquiry");
  return enquiry;
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, "status" | "internalNotes">>,
): Promise<Enquiry> {
  await ready();
  const admin = requirePermission("ENQUIRIES");
  const rows = readCollection<Enquiry>("enquiries");
  const existing = rows.find((e) => e.id === id);
  if (!existing) throw notFound("Enquiry");

  const next: Enquiry = {
    ...existing,
    ...patch,
    handledByUserId: admin.id,
    updatedAt: nowIso(),
  };
  writeCollection(
    "enquiries",
    rows.map((e) => (e.id === id ? next : e)),
    "update",
    id,
  );

  if (patch.status && patch.status !== existing.status) {
    logActivity(
      admin,
      "ENQUIRY_STATUS",
      `Enquiry from ${existing.name} → ${patch.status}`,
      id,
    );
  }
  return next;
}

/** Count of unread enquiries, for the admin sidebar badge. */
export async function countNewEnquiries(): Promise<number> {
  await ready();
  return readCollection<Enquiry>("enquiries").filter((e) => e.status === "NEW").length;
}

/** Pre-filled wa.me link for the quick WhatsApp action. */
export function whatsappLinkFor(enquiry: Enquiry): string {
  const text = encodeURIComponent(
    `Hello ${enquiry.name}, this is Quick Bites, Khandwa — about your enquiry.`,
  );
  const number = enquiry.phone.replace(/\D/g, "");
  return `https://wa.me/91${number}?text=${text}`;
}
