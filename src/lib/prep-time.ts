import type { CartLine, StoreSettings } from "@/types";

export interface PrepEstimateInput {
  /** Prep minutes of every line in the order. */
  prepMinutes: number[];
  /** How many orders are already in the kitchen (PLACED → READY). */
  activeOrders: number;
  basePrepBufferMinutes: number;
  perActiveOrderMinutes: number;
  /** Defaults to now; injectable so tests and the seed stay deterministic. */
  from?: Date;
}

/**
 * estimatedReadyAt = now
 *                  + max(item prepMinutes)
 *                  + basePrepBuffer
 *                  + (activeOrders × perActiveOrderMinutes)
 *
 * Rounded up to the next whole minute, because showing "ready by 7:42:17 PM"
 * would be absurd and rounding down would promise a time we cannot hit.
 */
export function estimatePrepMinutes({
  prepMinutes,
  activeOrders,
  basePrepBufferMinutes,
  perActiveOrderMinutes,
}: Omit<PrepEstimateInput, "from">): number {
  const slowestItem = prepMinutes.length > 0 ? Math.max(...prepMinutes) : 0;
  const queue = Math.max(0, activeOrders) * perActiveOrderMinutes;
  return Math.ceil(slowestItem + basePrepBufferMinutes + queue);
}

export function estimateReadyAt(input: PrepEstimateInput): Date {
  const from = input.from ?? new Date();
  const minutes = estimatePrepMinutes(input);
  const at = new Date(from.getTime() + minutes * 60_000);
  // Round up to the next whole minute.
  at.setSeconds(0, 0);
  if (at.getTime() < from.getTime() + minutes * 60_000) {
    at.setTime(at.getTime() + 60_000);
  }
  return at;
}

/** Convenience wrapper used by the cart and checkout screens. */
export function estimateReadyAtForLines(
  lines: Pick<CartLine, "prepMinutes">[],
  activeOrders: number,
  settings: Pick<StoreSettings, "basePrepBufferMinutes" | "perActiveOrderMinutes">,
  from?: Date,
): Date {
  return estimateReadyAt({
    prepMinutes: lines.map((line) => line.prepMinutes),
    activeOrders,
    basePrepBufferMinutes: settings.basePrepBufferMinutes,
    perActiveOrderMinutes: settings.perActiveOrderMinutes,
    from,
  });
}
