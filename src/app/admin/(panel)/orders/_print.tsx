"use client";

import { usePick, useT } from "@/i18n";
import { formatDateTime, formatPrice, formatTime } from "@/lib/format";
import { STORE } from "@/lib/constants";
import type { Order } from "@/types";

/**
 * Thermal print layouts, sized for an 80mm roll.
 *
 * Both live in the page, hidden, and the @media print rules in globals.css show
 * exactly one of them. That is why the body carries `data-printing="kot"` or
 * `"bill"` before window.print(): a prototype has no print server, and a
 * separate print window would lose the stylesheet.
 */

const ROW = "flex justify-between gap-2";

/** What the kitchen needs: tokens, items, options, notes. No money. */
export function KotLayout({ order }: { order: Order }) {
  const t = useT();
  const pick = usePick();

  return (
    <div id="print-kot" className="print-doc">
      <p className="text-center text-[11px] font-bold tracking-wider uppercase">
        {t.adm.orders.kot.title}
      </p>

      <p className="mt-1 text-center text-[32px] leading-none font-bold">
        {order.tokenNumber}
      </p>

      <p className="mt-1 text-center text-[11px]">
        {order.orderType === "TAKEAWAY"
          ? t.orderType.takeaway
          : `${t.orderType.dineIn}${order.tableNumber ? ` · ${t.adm.orders.kot.table} ${order.tableNumber}` : ""}`}
      </p>

      <hr className="my-2 border-dashed border-black" />

      <div className="grid gap-0.5 text-[11px]">
        <p className={ROW}>
          <span>{t.adm.orders.kot.placed}</span>
          <span>{formatTime(order.createdAt)}</span>
        </p>
        {order.estimatedReadyAt && (
          <p className={ROW}>
            <span>{t.adm.orders.kot.readyBy}</span>
            <span className="font-bold">{formatTime(order.estimatedReadyAt)}</span>
          </p>
        )}
        {order.isScheduled && order.scheduledFor && (
          <p className={ROW}>
            <span>{t.adm.orders.kot.scheduled}</span>
            <span className="font-bold">{formatTime(order.scheduledFor)}</span>
          </p>
        )}
        <p className={ROW}>
          <span>{order.id}</span>
          <span>{order.pickupName}</span>
        </p>
      </div>

      <hr className="my-2 border-dashed border-black" />

      <ul className="grid gap-1.5 text-[13px]">
        {order.lines.map((line, index) => (
          <li key={`${line.menuItemId}-${index}`}>
            <p className="flex gap-2 font-bold">
              <span>{line.quantity}×</span>
              <span className="flex-1">{pick(line.name)}</span>
            </p>
            {line.options.length > 0 && (
              <p className="pl-6 text-[11px]">
                {line.options.map((option) => pick(option.name)).join(", ")}
              </p>
            )}
            {line.notes && (
              <p className="pl-6 text-[11px] font-bold">** {line.notes} **</p>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <>
          <hr className="my-2 border-dashed border-black" />
          <p className="text-[12px] font-bold">
            {t.adm.orders.kot.note}: {order.notes}
          </p>
        </>
      )}

      <hr className="my-2 border-dashed border-black" />
      <p className="text-center text-[11px]">
        {t.adm.orders.itemCount(order.itemCount)}
      </p>
    </div>
  );
}

/** What the customer takes away: the money, itemised. */
export function BillLayout({ order }: { order: Order }) {
  const t = useT();
  const pick = usePick();

  const methodLabel =
    order.paymentMethod === "CASH"
      ? t.track.methodCash
      : order.paymentMethod === "ONLINE_CARD"
        ? t.track.methodCard
        : t.track.methodUpi;

  return (
    <div id="print-bill" className="print-doc">
      <p className="text-center text-[15px] font-bold tracking-wider uppercase">
        {STORE.name}
      </p>
      <p className="text-center text-[10px]">{STORE.addressFull}</p>
      <p className="text-center text-[10px]">{STORE.phoneDisplay}</p>
      <p className="mt-0.5 text-center text-[10px]">
        {t.adm.orders.bill.fssai(STORE.fssai)}
      </p>

      <hr className="my-2 border-dashed border-black" />

      <div className="grid gap-0.5 text-[11px]">
        <p className={ROW}>
          <span>{t.adm.orders.bill.invoice}</span>
          <span className="font-bold">{order.id}</span>
        </p>
        <p className={ROW}>
          <span>{t.adm.orders.kot.token}</span>
          <span className="font-bold">{order.tokenNumber}</span>
        </p>
        <p className={ROW}>
          <span>{t.adm.orders.bill.date}</span>
          <span>{formatDateTime(order.createdAt)}</span>
        </p>
        <p className={ROW}>
          <span>{t.adm.orders.kot.type}</span>
          <span>
            {order.orderType === "TAKEAWAY"
              ? t.orderType.takeaway
              : `${t.orderType.dineIn}${order.tableNumber ? ` ${order.tableNumber}` : ""}`}
          </span>
        </p>
      </div>

      <hr className="my-2 border-dashed border-black" />

      <ul className="grid gap-1 text-[11px]">
        {order.lines.map((line, index) => (
          <li key={`${line.menuItemId}-${index}`}>
            <p className={ROW}>
              <span className="flex-1">
                {line.quantity}× {pick(line.name)}
              </span>
              <span>{formatPrice(line.lineTotal)}</span>
            </p>
            {line.options.length > 0 && (
              <p className="pl-3 text-[10px]">
                {line.options.map((option) => pick(option.name)).join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>

      <hr className="my-2 border-dashed border-black" />

      <div className="grid gap-0.5 text-[11px]">
        <p className={ROW}>
          <span>{t.adm.orders.bill.subtotal}</span>
          <span>{formatPrice(order.subtotal)}</span>
        </p>
        {order.discount > 0 && (
          <p className={ROW}>
            <span>
              {t.adm.orders.bill.discount}
              {order.couponCode ? ` (${order.couponCode})` : ""}
            </span>
            <span>-{formatPrice(order.discount)}</span>
          </p>
        )}
        {order.packagingCharge > 0 && (
          <p className={ROW}>
            <span>{t.adm.orders.bill.packaging}</span>
            <span>{formatPrice(order.packagingCharge)}</span>
          </p>
        )}
        <p className={ROW}>
          <span>
            {t.adm.orders.bill.tax} {order.taxRate}%
          </span>
          <span>{formatPrice(order.tax)}</span>
        </p>
      </div>

      <hr className="my-2 border-black" />

      <p className={`${ROW} text-[15px] font-bold`}>
        <span>{t.adm.orders.bill.total}</span>
        <span>{formatPrice(order.total)}</span>
      </p>

      <hr className="my-2 border-dashed border-black" />

      <div className="grid gap-0.5 text-[11px]">
        <p className={ROW}>
          <span>{t.adm.orders.bill.method}</span>
          <span>{methodLabel}</span>
        </p>
        {order.paymentRef && (
          <p className={ROW}>
            <span>{t.adm.orders.bill.ref}</span>
            <span>{order.paymentRef}</span>
          </p>
        )}
        {order.cashReceived !== undefined && (
          <>
            <p className={ROW}>
              <span>{t.adm.orders.bill.cashReceived}</span>
              <span>{formatPrice(order.cashReceived)}</span>
            </p>
            <p className={ROW}>
              <span>{t.adm.orders.bill.change}</span>
              <span>{formatPrice(order.changeReturned ?? 0)}</span>
            </p>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-[11px]">{t.adm.orders.bill.thanks}</p>
    </div>
  );
}

/** Sets the print mode, prints, and clears it again. */
export function printDocument(which: "kot" | "bill") {
  document.body.dataset.printing = which;
  const clear = () => {
    delete document.body.dataset.printing;
    window.removeEventListener("afterprint", clear);
  };
  window.addEventListener("afterprint", clear);
  window.print();
  // Some browsers never fire afterprint; do not leave the page in print mode.
  window.setTimeout(clear, 2000);
}
