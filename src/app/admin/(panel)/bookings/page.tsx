"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RequireAdmin } from "@/features/auth";
import { OutletBadge, useAdminOutlet } from "@/features/outlet";
import { useBookings, useBookingSlots } from "@/features/bookings";
import { useSettings } from "@/features/settings";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatDate, formatSlotLabel, toDateKey } from "@/lib/format";
import { updateBookingStatus } from "@/services/bookings";
import { BOOKING_STATUSES, type BookingStatus, type TableBooking } from "@/types";
import { cn } from "@/lib/utils";

const ALL = "ALL";

const TONE: Record<BookingStatus, "warning" | "veg" | "success" | "danger" | "muted"> =
  {
    PENDING: "warning",
    CONFIRMED: "veg",
    SEATED: "success",
    CANCELLED: "danger",
    NO_SHOW: "muted",
  };

/** Confirm or cancel, with the message the guest receives. */
function StatusDialog({
  booking,
  next,
  onDone,
}: {
  booking: TableBooking | null;
  next: BookingStatus | null;
  onDone: () => void;
}) {
  const t = useT();
  const [message, setMessage] = useState("");

  const isConfirm = next === "CONFIRMED";
  const defaultMessage = isConfirm
    ? t.adm.bookings.confirmDefault
    : t.adm.bookings.cancelDefault;

  return (
    <ConfirmDialog
      open={!!booking && !!next}
      onOpenChange={(open) => {
        if (!open) {
          setMessage("");
          onDone();
        }
      }}
      title={isConfirm ? t.adm.bookings.confirmTitle : t.adm.bookings.cancelTitle}
      description={isConfirm ? t.adm.bookings.confirmBody : undefined}
      confirmLabel={isConfirm ? t.adm.bookings.confirm : t.adm.common.delete}
      isDestructive={!isConfirm}
      successMessage={t.adm.bookings.updated}
      onConfirm={async () => {
        if (!booking || !next) return;
        await updateBookingStatus(booking.id, next, message || defaultMessage);
        setMessage("");
        onDone();
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="bk-message">{t.adm.bookings.messageToGuest}</Label>
        <Textarea
          id="bk-message"
          rows={2}
          value={message}
          placeholder={defaultMessage}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
    </ConfirmDialog>
  );
}

/**
 * One day's slots, with how full each one is.
 *
 * Capacity is one room's capacity, so this view needs a specific outlet. On
 * the combined scope it falls back to the restaurant's floor — the list tab
 * is the one that spans both.
 */
function DayView({
  onAct,
}: {
  onAct: (booking: TableBooking, next: BookingStatus) => void;
}) {
  const t = useT();
  const { outletId } = useAdminOutlet();
  const forSlots = outletId ?? "restaurant";
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { data: bookings, isLoading } = useBookings({ date, outletId: forSlots });
  const { data: slots } = useBookingSlots(forSlots, date);
  const { data: settings } = useSettings(forSlots);

  const capacity = settings?.maxCoversPerSlot ?? 0;
  const live = (bookings ?? []).filter(
    (booking) => booking.status !== "CANCELLED" && booking.status !== "NO_SHOW",
  );

  const bySlot = useMemo(() => {
    const grouped = new Map<string, TableBooking[]>();
    for (const booking of live) {
      grouped.set(booking.time, [...(grouped.get(booking.time) ?? []), booking]);
    }
    return grouped;
  }, [live]);

  return (
    <div className="grid gap-4">
      <div className="flex items-end gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="day-date">{t.adm.bookings.colWhen}</Label>
          <Input
            id="day-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-9 w-44"
          />
        </div>
        <p className="nums pb-2 text-sm text-ink-muted">
          {formatDate(`${date}T00:00:00`)}
        </p>
      </div>

      {isLoading && <Skeleton className="h-48 w-full rounded-card" />}

      {!isLoading && (slots ?? []).length === 0 && (
        <EmptyState
          title={t.adm.bookings.noneForDay}
          description={t.adm.bookings.noneForDayBody}
        />
      )}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(slots ?? []).map((slot) => {
          const rows = bySlot.get(slot.time) ?? [];
          const covers = rows.reduce((sum, booking) => sum + booking.partySize, 0);
          const isOver = covers > capacity;

          if (rows.length === 0 && !slot.isFull) return null;

          return (
            <Card
              key={slot.time}
              className={cn(
                "p-3",
                isOver && "border-danger/30 bg-danger/5",
                !isOver && slot.isFull && "border-warning/30 bg-warning/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="nums text-sm font-bold text-ink">
                  {formatSlotLabel(slot.time)}
                </p>
                <Badge variant={isOver ? "danger" : slot.isFull ? "warning" : "muted"}>
                  {isOver
                    ? t.adm.bookings.overCapacity(covers - capacity)
                    : t.adm.bookings.coversAt(covers, capacity)}
                </Badge>
              </div>

              <ul className="mt-2 grid gap-1.5">
                {rows.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-1.5 text-sm first:border-0 first:pt-0"
                  >
                    <span className="min-w-0">
                      <span className="truncate font-medium text-ink">
                        {booking.name}
                      </span>
                      <span className="nums ml-1.5 text-xs text-ink-muted">
                        {t.booking.people(booking.partySize)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Badge variant={TONE[booking.status]}>
                        {t.adm.bookings.status[booking.status]}
                      </Badge>
                      {booking.status === "PENDING" && (
                        <Button size="xs" onClick={() => onAct(booking, "CONFIRMED")}>
                          {t.adm.bookings.confirm}
                        </Button>
                      )}
                      {booking.status === "CONFIRMED" && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => onAct(booking, "SEATED")}
                        >
                          {t.adm.bookings.markSeated}
                        </Button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BookingsModule() {
  const t = useT();
  const { outletId, isAll } = useAdminOutlet();
  const [view, setView] = useState("list");
  const [status, setStatus] = useState<BookingStatus | typeof ALL>(ALL);
  const { data: bookings, isLoading } = useBookings(
    status === ALL ? { outletId } : { status, outletId },
  );

  const [acting, setActing] = useState<TableBooking | null>(null);
  const [nextStatus, setNextStatus] = useState<BookingStatus | null>(null);

  const act = (booking: TableBooking, next: BookingStatus) => {
    // Seated and no-show need no message, so they apply straight away.
    if (next === "SEATED" || next === "NO_SHOW") {
      void updateBookingStatus(booking.id, next)
        .then(() => toast.success(t.adm.bookings.updated))
        .catch((error) => toast.error(toErrorMessage(error)));
      return;
    }
    setActing(booking);
    setNextStatus(next);
  };

  const columns: AdminColumn<TableBooking>[] = [
    ...(isAll
      ? [
          {
            id: "outlet",
            header: t.adm.outlet.outletColumn,
            sortValue: (row: TableBooking) => row.outletId,
            cell: (row: TableBooking) => <OutletBadge outletId={row.outletId} />,
          } satisfies AdminColumn<TableBooking>,
        ]
      : []),
    {
      id: "when",
      header: t.adm.bookings.colWhen,
      sortValue: (row) => `${row.date}${row.time}`,
      searchValue: (row) => `${row.name} ${row.phone} ${row.id}`,
      cell: (row) => (
        <span className="nums block">
          <span className="font-semibold text-ink">
            {formatDate(`${row.date}T00:00:00`)}
          </span>
          <span className="block text-xs text-ink-muted">
            {formatSlotLabel(row.time)}
          </span>
        </span>
      ),
    },
    {
      id: "guest",
      header: t.adm.bookings.colGuest,
      sortValue: (row) => row.name,
      cell: (row) => (
        <span className="block min-w-0">
          <span className="truncate font-medium text-ink">{row.name}</span>
          <span className="nums block text-xs text-ink-muted">{row.phone}</span>
        </span>
      ),
    },
    {
      id: "party",
      header: t.adm.bookings.colParty,
      align: "right",
      sortValue: (row) => row.partySize,
      cell: (row) => <span className="nums text-ink">{row.partySize}</span>,
    },
    {
      id: "request",
      header: t.booking.request,
      cell: (row) => (
        <span className="block max-w-xs truncate text-xs text-ink-muted">
          {row.specialRequest ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: t.adm.common.status,
      sortValue: (row) => row.status,
      cell: (row) => (
        <Badge variant={TONE[row.status]}>{t.adm.bookings.status[row.status]}</Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      interactive: true,
      className: "w-44",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === "PENDING" && (
            <>
              <Button size="xs" onClick={() => act(row, "CONFIRMED")}>
                {t.adm.bookings.confirm}
              </Button>
              <Button
                size="xs"
                variant="destructive-ghost"
                onClick={() => act(row, "CANCELLED")}
              >
                {t.common.cancel}
              </Button>
            </>
          )}
          {row.status === "CONFIRMED" && (
            <>
              <Button size="xs" variant="outline" onClick={() => act(row, "SEATED")}>
                {t.adm.bookings.markSeated}
              </Button>
              <Button size="xs" variant="ghost" onClick={() => act(row, "NO_SHOW")}>
                {t.adm.bookings.markNoShow}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={t.adm.bookings.title} description={t.adm.bookings.subtitle}>
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="list">{t.adm.bookings.listView}</TabsTrigger>
            <TabsTrigger value="day">{t.adm.bookings.dayView}</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      {view === "day" ? (
        <DayView onAct={act} />
      ) : (
        <DataTable
          data={bookings ?? []}
          columns={columns}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          searchPlaceholder={t.adm.bookings.search}
          csvName="bookings"
          filters={
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as BookingStatus)}
            >
              <SelectTrigger
                size="sm"
                aria-label={t.adm.common.status}
                className="w-40"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t.adm.table.all}</SelectItem>
                {BOOKING_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t.adm.bookings.status[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
          toCsvRow={(row) => ({
            id: row.id,
            date: row.date,
            time: row.time,
            name: row.name,
            phone: row.phone,
            party: row.partySize,
            status: row.status,
            request: row.specialRequest ?? "",
          })}
          renderCard={(row) => (
            <Card className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="nums font-semibold text-ink">
                    {formatDate(`${row.date}T00:00:00`)} · {formatSlotLabel(row.time)}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {row.name} · {t.booking.people(row.partySize)}
                  </p>
                </div>
                <Badge variant={TONE[row.status]}>
                  {t.adm.bookings.status[row.status]}
                </Badge>
              </div>
              {row.status === "PENDING" && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => act(row, "CONFIRMED")}
                >
                  {t.adm.bookings.confirm}
                </Button>
              )}
            </Card>
          )}
        />
      )}

      <StatusDialog
        booking={acting}
        next={nextStatus}
        onDone={() => {
          setActing(null);
          setNextStatus(null);
        }}
      />
    </>
  );
}

export default function AdminBookingsPage() {
  return (
    <RequireAdmin permission="BOOKINGS">
      <BookingsModule />
    </RequireAdmin>
  );
}
