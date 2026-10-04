import { conflict, invalid, notFound } from "@/lib/errors";
import { readCollection, writeCollection } from "@/storage";
import type { Order, OutletId, Review } from "@/types";
import { notify, notifyAdmins } from "./notifications";
import {
  logActivity,
  newId,
  nowIso,
  ready,
  requirePermission,
  requireUser,
} from "./common";
import { adminReadScope, assertOutletAccess } from "./outlets";

export interface RatingSummary {
  average: number;
  total: number;
  /** Count per star, indexed 1–5. */
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export async function listReviews(
  outletId?: OutletId,
  approvedOnly = true,
): Promise<Review[]> {
  await ready();
  const scope = approvedOnly ? outletId : adminReadScope(outletId);
  return readCollection<Review>("reviews")
    .filter((r) => !scope || r.outletId === scope)
    .filter((r) => !approvedOnly || r.isApproved)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getRatingSummary(outletId?: OutletId): Promise<RatingSummary> {
  await ready();
  const rows = readCollection<Review>("reviews").filter(
    (r) => r.isApproved && (!outletId || r.outletId === outletId),
  );
  const distribution: RatingSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of rows) distribution[review.rating] += 1;

  const total = rows.length;
  const sum = rows.reduce((acc, r) => acc + r.rating, 0);
  return {
    average: total === 0 ? 0 : Math.round((sum / total) * 10) / 10,
    total,
    distribution,
  };
}

export interface CreateReviewInput {
  outletId: OutletId;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  orderId?: string;
}

/** Customers submit reviews; they stay hidden until an admin approves. */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  await ready();
  const user = requireUser();

  if (!input.comment.trim()) throw invalid("Please write a few words.", "comment");

  if (input.orderId) {
    const order = readCollection<Order>("orders").find((o) => o.id === input.orderId);
    if (!order) throw notFound("Order");
    if (order.customerId !== user.id) {
      throw conflict("You can only review your own orders.");
    }
    if (order.status !== "HANDED_OVER") {
      throw conflict("You can rate an order once it has been handed over.");
    }
    const already = readCollection<Review>("reviews").some(
      (r) => r.orderId === input.orderId,
    );
    if (already) throw conflict("You have already rated this order.");
  }

  const review: Review = {
    id: newId("rev"),
    outletId: input.outletId,
    customerId: user.id,
    customerName: user.name,
    orderId: input.orderId,
    rating: input.rating,
    comment: input.comment.trim(),
    isApproved: false,
    createdAt: nowIso(),
  };

  const rows = readCollection<Review>("reviews");
  writeCollection("reviews", [review, ...rows], "create", review.id);
  notifyAdmins("CONTENT", {
    outletId: review.outletId,
    type: "NEW_REVIEW",
    params: { rating: review.rating, name: review.customerName },
    link: "/admin/reviews",
    dedupeKey: `review:${review.id}`,
  });
  return review;
}

export async function setReviewApproval(
  id: string,
  isApproved: boolean,
): Promise<Review> {
  await ready();
  const admin = requirePermission("CONTENT");
  const rows = readCollection<Review>("reviews");
  const existing = rows.find((r) => r.id === id);
  if (!existing) throw notFound("Review");
  assertOutletAccess(existing.outletId);

  const next: Review = { ...existing, isApproved, updatedAt: nowIso() };
  writeCollection(
    "reviews",
    rows.map((r) => (r.id === id ? next : r)),
    "update",
    id,
  );
  logActivity(
    admin,
    isApproved ? "REVIEW_APPROVED" : "REVIEW_HIDDEN",
    `${isApproved ? "Approved" : "Hid"} review by ${existing.customerName}`,
    id,
  );
  return next;
}

export async function replyToReview(id: string, reply: string): Promise<Review> {
  await ready();
  const admin = requirePermission("CONTENT");
  if (!reply.trim()) throw invalid("Write a reply before saving.", "reply");

  const rows = readCollection<Review>("reviews");
  const existing = rows.find((r) => r.id === id);
  if (!existing) throw notFound("Review");
  assertOutletAccess(existing.outletId);

  const at = nowIso();
  const next: Review = {
    ...existing,
    reply: reply.trim(),
    repliedAt: at,
    updatedAt: at,
  };
  writeCollection(
    "reviews",
    rows.map((r) => (r.id === id ? next : r)),
    "update",
    id,
  );
  notify({
    userId: next.customerId,
    outletId: next.outletId,
    type: "REVIEW_REPLIED",
    params: { name: next.customerName },
    link: "/reviews",
    dedupeKey: `reply:${id}`,
  });
  logActivity(
    admin,
    "REVIEW_REPLIED",
    `Replied to review by ${existing.customerName}`,
    id,
  );
  return next;
}

/** Orders the signed-in customer has picked up but not yet rated. */
export async function listRateableOrders(): Promise<Order[]> {
  await ready();
  const user = requireUser();
  const rated = new Set(
    readCollection<Review>("reviews")
      .filter((r) => r.orderId)
      .map((r) => r.orderId as string),
  );
  return readCollection<Order>("orders").filter(
    (o) => o.customerId === user.id && o.status === "HANDED_OVER" && !rated.has(o.id),
  );
}
