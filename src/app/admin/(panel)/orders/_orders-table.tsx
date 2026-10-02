"use client";

import { useMemo, useState } from "react";
import { PaymentBadge, StatusBadge } from "@/components/admin/badges";
import { DataTable, type AdminColumn } from "@/components/admin/data-table";
import {
  DateRangePicker,
  resolvePreset,
  type RangePreset,
} from "@/components/admin/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from "@/features/orders";
import { usePick, useT } from "@/i18n";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { DateRange } from "@/services/reports";
import {
  ORDER_STATUSES,
  ORDER_TYPES,
  PAYMENT_STATUSES,
  type Order,
  type OrderStatus,
  type OrderType,
  type PaymentStatus,
} from "@/types";

const ALL = "ALL";

/**
 * Every order, with the filters the cafe asks for after the fact: what happened
 * on Saturday, which payments failed, who ordered dine-in. Exports what the
 * filters left, not the whole history.
 */
export function OrdersTable({ onOpenDetail }: { onOpenDetail: (order: Order) => void }) {
  const t = useT();
  const pick = usePick();

  const [preset, setPreset] = useState<RangePreset>("last7");
  const [range, setRange] = useState<DateRange>(() => resolvePreset("last7"));
  const [status, setStatus] = useState<OrderStatus | typeof ALL>(ALL);
  const [payment, setPayment] = useState<PaymentStatus | typeof ALL>(ALL);
  const [orderType, setOrderType] = useState<OrderType | typeof ALL>(ALL);

  const { data: orders, isLoading } = useOrders({
    status: "ALL",
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  });

  const rows = useMemo(
    () =>
      (orders ?? []).filter(
        (order) =>
          (status === ALL || order.status === status) &&
          (payment === ALL || order.paymentStatus === payment) &&
          (orderType === ALL || order.orderType === orderType),
      ),
    [orders, status, payment, orderType],
  );

  const statusLabel = (value: OrderStatus) =>
    value === "PLACED"
      ? t.track.steps.placed
      : value === "ACCEPTED"
        ? t.track.steps.accepted
        : value === "PREPARING"
          ? t.track.steps.preparing
          : value === "READY"
            ? t.track.steps.ready
            : value === "HANDED_OVER"
              ? t.track.steps.handedOverTakeaway
              : t.track.steps.cancelled;

  const paymentLabel = (value: PaymentStatus) =>
    value === "VERIFIED"
      ? t.track.paidWith("")
      : value === "PAID_UNVERIFIED"
        ? t.adm.orders.payVerifying
        : value === "FAILED"
          ? t.track.paymentFailed
          : value === "REFUNDED"
            ? t.track.refunded
            : t.adm.orders.payCashPending;

  const columns: AdminColumn<Order>[] = [
    {
      id: "token",
      header: t.adm.orders.colToken,
      sortValue: (order) => order.tokenNumber,
      searchValue: (order) => `${order.tokenNumber} ${order.id}`,
      cell: (order) => (
        <span className="nums font-semibold text-ink">{order.tokenNumber}</span>
      ),
    },
    {
      id: "placed",
      header: t.adm.orders.colPlaced,
      sortValue: (order) => Date.parse(order.createdAt),
      cell: (order) => (
        <span className="nums text-ink-muted">{formatDateTime(order.createdAt)}</span>
      ),
    },
    {
      id: "customer",
      header: t.adm.orders.colCustomer,
      sortValue: (order) => order.pickupName,
      searchValue: (order) => `${order.pickupName} ${order.phone}`,
      cell: (order) => (
        <span className="block min-w-0">
          <span className="block truncate text-ink">{order.pickupName}</span>
          <span className="nums block text-xs text-ink-muted">{order.phone}</span>
        </span>
      ),
    },
    {
      id: "type",
      header: t.adm.orders.colType,
      sortValue: (order) => order.orderType,
      cell: (order) => (
        <span className="text-ink-muted">
          {order.orderType === "TAKEAWAY" ? t.orderType.takeaway : t.orderType.dineIn}
          {order.tableNumber ? ` · ${order.tableNumber}` : ""}
        </span>
      ),
    },
    {
      id: "items",
      header: t.adm.orders.colItems,
      align: "right",
      sortValue: (order) => order.itemCount,
      cell: (order) => <span className="nums text-ink-muted">{order.itemCount}</span>,
    },
    {
      id: "total",
      header: t.adm.orders.colTotal,
      align: "right",
      sortValue: (order) => order.total,
      cell: (order) => (
        <span className="nums font-semibold text-ink">{formatPrice(order.total)}</span>
      ),
    },
    {
      id: "status",
      header: t.adm.orders.colStatus,
      sortValue: (order) => order.status,
      cell: (order) => <StatusBadge status={order.status} orderType={order.orderType} />,
    },
    {
      id: "payment",
      header: t.adm.orders.colPayment,
      sortValue: (order) => order.paymentStatus,
      cell: (order) => <PaymentBadge order={order} />,
    },
  ];

  const filters = (
    <>
      <DateRangePicker
        preset={preset}
        range={range}
        onChange={(nextPreset, nextRange) => {
          setPreset(nextPreset);
          setRange(nextRange);
        }}
      />

      <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
        <SelectTrigger size="sm" aria-label={t.adm.orders.filterStatus} className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t.adm.orders.filterStatus}</SelectItem>
          {ORDER_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {statusLabel(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={payment}
        onValueChange={(value) => setPayment(value as PaymentStatus)}
      >
        <SelectTrigger size="sm" aria-label={t.adm.orders.filterPayment} className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t.adm.orders.filterPayment}</SelectItem>
          {PAYMENT_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {paymentLabel(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={orderType}
        onValueChange={(value) => setOrderType(value as OrderType)}
      >
        <SelectTrigger size="sm" aria-label={t.adm.orders.filterType} className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t.adm.orders.filterType}</SelectItem>
          {ORDER_TYPES.map((value) => (
            <SelectItem key={value} value={value}>
              {value === "TAKEAWAY" ? t.orderType.takeaway : t.orderType.dineIn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );

  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(order) => order.id}
      isLoading={isLoading}
      filters={filters}
      searchPlaceholder={t.adm.orders.searchPlaceholder}
      onRowClick={onOpenDetail}
      csvName="orders"
      toCsvRow={(order) => ({
        token: order.tokenNumber,
        order: order.id,
        placed: formatDateTime(order.createdAt),
        customer: order.pickupName,
        phone: order.phone,
        type: order.orderType,
        items: order.itemCount,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        total: order.total,
        status: order.status,
        payment: order.paymentStatus,
        method: order.paymentMethod,
      })}
      renderCard={(order) => (
        <Card className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="nums text-lg font-bold text-ink">{order.tokenNumber}</p>
              <p className="truncate text-xs text-ink-muted">
                {order.pickupName} · {order.id}
              </p>
              <p className="nums mt-0.5 text-xs text-ink-muted">
                {formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="nums font-semibold text-ink">{formatPrice(order.total)}</p>
              <Badge variant="muted" className="mt-1">
                {order.itemCount}
              </Badge>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusBadge status={order.status} orderType={order.orderType} />
            <PaymentBadge order={order} />
          </div>
          <p className="mt-1.5 truncate text-xs text-ink-muted">
            {order.lines.map((line) => `${line.quantity}× ${pick(line.name)}`).join(", ")}
          </p>
        </Card>
      )}
    />
  );
}
