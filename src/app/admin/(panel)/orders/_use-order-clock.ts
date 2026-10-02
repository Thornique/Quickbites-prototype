"use client";

import { useEffect, useState } from "react";

/**
 * Re-renders the board every 20 seconds.
 *
 * "Placed 4 min ago" and the ready-by countdown are derived from the clock, not
 * from stored data, so nothing writes to localStorage and nothing syncs between
 * tabs — the board simply has to look at the time again now and then.
 */
export function useOrderClock(intervalMs = 20_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}
