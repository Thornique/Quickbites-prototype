"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePrepEstimate } from "@/features/settings";
import { useT } from "@/i18n";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  accept,
  cancelOrder,
  extendReadyTime,
  recordCashPayment,
  rejectPayment,
  verifyAndAccept,
} from "@/services/orders";
import { needsRefund } from "@/services/order-rules";
import type { Order } from "@/types";

const QUICK_MINUTES = [5, 10, 15, 20, 30];

/**
 * Accept, with the ready time the customer will be promised.
 *
 * Quick picks plus a custom box, pre-selected with the kitchen's own estimate:
 * the admin decides, but the sensible answer is one tap away on a busy evening.
 * For an unverified online payment this verifies and accepts in one go, which is
 * what the counter actually does — they look at the reference and say yes.
 */
export function AcceptDialog({
  order,
  needsVerification,
  open,
  onOpenChange,
}: {
  order: Order;
  needsVerification: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  // The queue at the order's own counter, not whichever one is selected.
  const { data: estimate } = usePrepEstimate(order.outletId);
  const [minutes, setMinutes] = useState(15);
  const [isCustom, setIsCustom] = useState(false);

  // Snap to the kitchen estimate whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    const suggested = estimate ?? 15;
    const nearest = QUICK_MINUTES.reduce((best, option) =>
      Math.abs(option - suggested) < Math.abs(best - suggested) ? option : best,
    );
    setMinutes(nearest);
    setIsCustom(false);
  }, [open, estimate]);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.adm.orders.acceptTitle}
      description={t.adm.orders.acceptBody}
      confirmLabel={t.adm.orders.confirmAccept}
      isConfirmDisabled={minutes < 1 || minutes > 90}
      successMessage={t.adm.orders.accepted(order.tokenNumber, minutes)}
      onConfirm={() =>
        needsVerification
          ? verifyAndAccept(order.id, minutes)
          : accept(order.id, minutes)
      }
    >
      <div className="grid gap-4">
        {/* What the admin is confirming receipt of. */}
        {needsVerification && (
          <div className="grid gap-2 rounded-card border border-hairline bg-sand-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                {t.adm.orders.amountPaid}
              </span>
              <span className="nums text-base font-bold text-ink">
                {formatPrice(order.total)}
              </span>
            </div>
            {order.paymentRef && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                  {t.adm.orders.transactionRef}
                </span>
                <span className="nums text-sm text-ink">{order.paymentRef}</span>
              </div>
            )}
          </div>
        )}

        {order.isScheduled && order.scheduledFor ? (
          /* A scheduled order's ready time is its slot — nothing to choose. */
          <p className="text-sm text-ink-muted">
            {t.adm.orders.scheduledFor(
              new Date(order.scheduledFor).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
              }),
            )}
          </p>
        ) : (
          <div className="grid gap-2">
            <Label>{t.adm.orders.readyIn}</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_MINUTES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setMinutes(option);
                    setIsCustom(false);
                  }}
                  aria-pressed={!isCustom && minutes === option}
                  className={cn(
                    "nums rounded-control border px-3 py-2 text-sm font-semibold transition-colors",
                    !isCustom && minutes === option
                      ? "border-brand bg-brand text-white"
                      : "border-hairline bg-surface text-ink hover:border-ink-muted",
                  )}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                aria-pressed={isCustom}
                className={cn(
                  "rounded-control border px-3 py-2 text-sm font-semibold transition-colors",
                  isCustom
                    ? "border-brand bg-brand text-white"
                    : "border-hairline bg-surface text-ink hover:border-ink-muted",
                )}
              >
                {t.adm.range.custom}
              </button>
            </div>

            {isCustom && (
              <div className="grid gap-1.5">
                <Label htmlFor="accept-minutes">{t.adm.orders.customMinutes}</Label>
                <Input
                  id="accept-minutes"
                  type="number"
                  min={1}
                  max={90}
                  value={minutes}
                  autoFocus
                  onChange={(event) => setMinutes(Number(event.target.value))}
                  className="w-28"
                />
              </div>
            )}

            {estimate !== undefined && (
              <Badge variant="muted" className="w-fit">
                {t.adm.orders.suggested(estimate)}
              </Badge>
            )}
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}

/** Reject a claimed online payment; a reason is required. */
export function RejectDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.adm.orders.rejectTitle}
      description={t.adm.orders.rejectBody}
      confirmLabel={t.adm.orders.confirmReject}
      isDestructive
      isConfirmDisabled={reason.trim().length === 0}
      successMessage={t.adm.orders.rejected}
      onConfirm={() => rejectPayment(order.id, reason)}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="reject-reason">{t.adm.orders.rejectReason}</Label>
        <Textarea
          id="reject-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t.adm.orders.rejectReasonPlaceholder}
          rows={2}
          autoFocus
        />
      </div>
    </ConfirmDialog>
  );
}

/** +5 / +10 when the kitchen is behind. Pushed to the customer immediately. */
export function ExtendDialog({
  order,
  extraMinutes,
  open,
  onOpenChange,
}: {
  order: Order;
  extraMinutes: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.adm.orders.extendTitle(extraMinutes)}
      description={t.adm.orders.extendBody}
      confirmLabel={t.adm.orders.confirmExtend}
      successMessage={t.adm.orders.extended(extraMinutes)}
      onConfirm={() => extendReadyTime(order.id, extraMinutes, reason || undefined)}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="extend-reason">{t.adm.orders.extendReason}</Label>
        <Input
          id="extend-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t.adm.orders.extendReasonPlaceholder}
        />
      </div>
    </ConfirmDialog>
  );
}

/** Cash at the counter, with the change worked out as the admin types. */
export function CashDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [received, setReceived] = useState(order.total);

  useEffect(() => {
    if (open) setReceived(order.total);
  }, [open, order.total]);

  const change = Math.max(0, received - order.total);
  const isShort = received < order.total;

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.adm.orders.cashTitle}
      description={t.adm.orders.cashBody(formatPrice(order.total))}
      confirmLabel={t.adm.orders.confirmCash}
      isConfirmDisabled={isShort}
      successMessage={t.adm.orders.cashRecorded(formatPrice(change))}
      onConfirm={() => recordCashPayment(order.id, received)}
    >
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="cash-received">{t.adm.orders.amountReceived}</Label>
          <Input
            id="cash-received"
            type="number"
            min={0}
            step={1}
            value={received}
            autoFocus
            onChange={(event) => setReceived(Number(event.target.value))}
            aria-invalid={isShort || undefined}
            className="nums w-36 text-lg"
          />
        </div>

        {/* The number the admin actually needs: what to hand back. */}
        <div
          className={cn(
            "flex items-center justify-between rounded-card border p-3",
            isShort ? "border-danger/30 bg-danger/5" : "border-veg/25 bg-veg/5",
          )}
        >
          <span className="text-sm font-semibold text-ink">
            {t.adm.orders.changeToReturn}
          </span>
          <span className="nums text-xl font-bold text-ink">{formatPrice(change)}</span>
        </div>

        {/* Common notes, so nobody types 500 by hand. */}
        <div className="flex flex-wrap gap-2">
          {[order.total, 100, 200, 500, 2000]
            .filter((note, index, all) => all.indexOf(note) === index)
            .map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => setReceived(note)}
                className="nums rounded-control border border-hairline bg-surface px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-ink-muted"
              >
                {formatPrice(note)}
              </button>
            ))}
        </div>
      </div>
    </ConfirmDialog>
  );
}

/** Cancel, with a reason, and a note about the refund where one is due. */
export function CancelDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.adm.orders.cancelTitle}
      description={t.adm.orders.cancelBody}
      confirmLabel={t.adm.orders.confirmCancel}
      isDestructive
      isConfirmDisabled={reason.trim().length === 0}
      successMessage={t.adm.orders.cancelled}
      onConfirm={() => cancelOrder(order.id, reason)}
    >
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="cancel-reason">{t.adm.orders.cancelReason}</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t.adm.orders.cancelReasonPlaceholder}
            rows={2}
            autoFocus
          />
        </div>
        {needsRefund(order.paymentStatus) && (
          <p className="rounded-control border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-ink">
            {t.adm.orders.cancelRefundNote}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}
