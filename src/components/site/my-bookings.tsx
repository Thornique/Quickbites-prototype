"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth";
import { useMyBookings } from "@/features/bookings";
import { useT } from "@/i18n";
import { formatSlotLabel } from "@/lib/format";
import type { BookingStatus } from "@/types";

const TONE: Record<BookingStatus, "warning" | "success" | "muted" | "danger"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  SEATED: "success",
  CANCELLED: "danger",
  NO_SHOW: "muted",
};

/**
 * The signed-in customer's own bookings with their current status. Rendered on
 * /book-table under the form and on /account, so a booking is never something
 * you request and then cannot find again.
 */
export function MyBookings({ limit }: { limit?: number }) {
  const t = useT();
  const { user, isReady } = useSession();
  const { data: bookings, isLoading } = useMyBookings();

  if (!isReady || !user) return null;

  const rows = limit ? (bookings ?? []).slice(0, limit) : (bookings ?? []);

  return (
    <section>
      <h2 className="text-sm font-semibold text-ink">{t.booking.myBookings}</h2>

      {isLoading && <Skeleton className="mt-3 h-20 w-full rounded-card" />}

      {!isLoading && rows.length === 0 && (
        <Card className="mt-3 border-dashed p-5">
          <p className="text-sm font-semibold text-ink">{t.booking.noBookings}</p>
          <p className="mt-1 text-sm text-ink-muted">{t.booking.noBookingsBody}</p>
        </Card>
      )}

      <ul className="mt-3 grid gap-2">
        {rows.map((booking) => (
          <li key={booking.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="nums text-sm font-semibold text-ink">
                  {booking.date} · {formatSlotLabel(booking.time)}
                </p>
                <p className="nums mt-0.5 text-xs text-ink-muted">
                  {t.booking.people(booking.partySize)} · {booking.id}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={TONE[booking.status]}>
                  {t.booking.status[booking.status]}
                </Badge>
                {booking.statusMessage && (
                  <p className="mt-1 text-xs text-ink-muted">{booking.statusMessage}</p>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
