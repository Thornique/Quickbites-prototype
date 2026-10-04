"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSettings } from "@/features/settings";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { canHandOver, canStartKitchen } from "@/services/order-rules";
import { advanceOrder, handOver } from "@/services/orders";
import type { Order } from "@/types";
import {
  AcceptDialog,
  CancelDialog,
  CashDialog,
  ExtendDialog,
  RejectDialog,
} from "./_dialogs";

type DialogName = "accept" | "reject" | "cash" | "cancel" | "extend5" | "extend10";

export interface OrderActionsProps {
  order: Order;
  /** Opens the detail sheet from the overflow menu. */
  onOpenDetail?: (order: Order) => void;
  /** `card` puts the primary action full width; `row` keeps it compact. */
  layout?: "card" | "row";
}

/**
 * One primary action per order, everything else behind a menu.
 *
 * Which action is primary follows from the order's state, and it is the only
 * thing the person at the counter has to decide about — on a busy evening a row
 * of equally weighted buttons is how the wrong one gets pressed. Actions the
 * rules forbid are shown disabled with the rule's own reason in a tooltip,
 * rather than hidden, so the block is explainable.
 */
export function OrderActions({
  order,
  onOpenDetail,
  layout = "card",
}: OrderActionsProps) {
  const t = useT();
  const { data: settings } = useSettings(order.outletId);
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const run = async (action: () => Promise<unknown>, message: string) => {
    setIsWorking(true);
    try {
      await action();
      toast.success(message);
    } catch (caught) {
      toast.error(toErrorMessage(caught));
    } finally {
      setIsWorking(false);
    }
  };

  const isOnlineUnverified = order.paymentStatus === "PAID_UNVERIFIED";
  // Accepting is what starts the kitchen now, so the prep gate guards the
  // Accept button rather than a separate "start preparing" step.
  const prepGate = settings
    ? canStartKitchen(order, settings)
    : { ok: true as boolean, reason: undefined as string | undefined };
  const handoverGate = canHandOver(order);
  const isCashUnpaid =
    order.paymentMethod === "CASH" && order.paymentStatus !== "VERIFIED";

  /** The one button. */
  const primary = (() => {
    switch (order.status) {
      case "PLACED":
        return {
          label: isOnlineUnverified
            ? t.adm.orders.verifyAndAccept
            : t.adm.orders.accept,
          onClick: () => setDialog("accept"),
          // Verifying the payment is part of the same click, so only a cash
          // order the settings hold back can be blocked here.
          disabled: !isOnlineUnverified && !prepGate.ok,
          reason: isOnlineUnverified ? undefined : prepGate.reason,
        };
      // A scheduled order waiting for its slot. The kitchen starts it
      // automatically at the slot, so there is nothing to press here.
      case "ACCEPTED":
        return null;
      case "PREPARING":
        return {
          label: t.adm.orders.markReady,
          onClick: () =>
            void run(() => advanceOrder(order.id, "READY"), t.adm.orders.markedReady),
          disabled: false,
          reason: undefined,
        };
      case "READY":
        // Cash still owing? Taking the money is the step before handing over.
        if (isCashUnpaid) {
          return {
            label: t.adm.orders.recordCash,
            onClick: () => setDialog("cash"),
            disabled: false,
            reason: undefined,
          };
        }
        return {
          label:
            order.orderType === "TAKEAWAY"
              ? t.adm.orders.handOverTakeaway
              : t.adm.orders.handOverDineIn,
          onClick: () => void run(() => handOver(order.id), t.adm.orders.handedOver),
          disabled: !handoverGate.ok,
          reason: handoverGate.reason,
        };
      default:
        return null;
    }
  })();

  const isClosed = order.status === "HANDED_OVER" || order.status === "CANCELLED";

  const primaryButton = primary && (
    <Button
      size={layout === "card" ? "default" : "sm"}
      disabled={isWorking || primary.disabled}
      onClick={primary.onClick}
      className={layout === "card" ? "flex-1" : undefined}
    >
      {primary.label}
    </Button>
  );

  return (
    <>
      <div className="flex items-center gap-2">
        {primary &&
          (primary.disabled && primary.reason ? (
            <Tooltip>
              {/* A disabled button swallows pointer events, so the span carries them. */}
              <TooltipTrigger asChild>
                <span className={layout === "card" ? "flex-1" : undefined}>
                  {primaryButton}
                </span>
              </TooltipTrigger>
              <TooltipContent>{primary.reason}</TooltipContent>
            </Tooltip>
          ) : (
            primaryButton
          ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={layout === "card" ? "icon" : "icon-sm"}
              aria-label={t.adm.orders.viewDetail}
            >
              <MoreVertical aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {onOpenDetail && (
              <DropdownMenuItem onSelect={() => onOpenDetail(order)}>
                {t.adm.orders.viewDetail}
              </DropdownMenuItem>
            )}

            {isOnlineUnverified && (
              <DropdownMenuItem onSelect={() => setDialog("reject")}>
                {t.adm.orders.rejectPayment}
              </DropdownMenuItem>
            )}

            {order.status === "PREPARING" && (
              <>
                <DropdownMenuItem onSelect={() => setDialog("extend5")}>
                  {t.adm.orders.addFive}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDialog("extend10")}>
                  {t.adm.orders.addTen}
                </DropdownMenuItem>
              </>
            )}

            {isCashUnpaid && order.status !== "READY" && !isClosed && (
              <DropdownMenuItem onSelect={() => setDialog("cash")}>
                {t.adm.orders.recordCash}
              </DropdownMenuItem>
            )}

            {order.status === "READY" && !isCashUnpaid && handoverGate.ok && (
              <DropdownMenuItem
                onSelect={() =>
                  void run(() => handOver(order.id), t.adm.orders.handedOver)
                }
              >
                {order.orderType === "TAKEAWAY"
                  ? t.adm.orders.handOverTakeaway
                  : t.adm.orders.handOverDineIn}
              </DropdownMenuItem>
            )}

            {!isClosed && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => setDialog("cancel")}
                >
                  {t.adm.orders.cancel}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AcceptDialog
        order={order}
        needsVerification={isOnlineUnverified}
        open={dialog === "accept"}
        onOpenChange={(open) => setDialog(open ? "accept" : null)}
      />
      <RejectDialog
        order={order}
        open={dialog === "reject"}
        onOpenChange={(open) => setDialog(open ? "reject" : null)}
      />
      <CashDialog
        order={order}
        open={dialog === "cash"}
        onOpenChange={(open) => setDialog(open ? "cash" : null)}
      />
      <CancelDialog
        order={order}
        open={dialog === "cancel"}
        onOpenChange={(open) => setDialog(open ? "cancel" : null)}
      />
      <ExtendDialog
        order={order}
        extraMinutes={5}
        open={dialog === "extend5"}
        onOpenChange={(open) => setDialog(open ? "extend5" : null)}
      />
      <ExtendDialog
        order={order}
        extraMinutes={10}
        open={dialog === "extend10"}
        onOpenChange={(open) => setDialog(open ? "extend10" : null)}
      />
    </>
  );
}
