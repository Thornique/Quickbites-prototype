"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Wallet } from "lucide-react";
import { CartSummary } from "@/components/site/cart-summary";
import { OrderTypeToggle } from "@/components/site/order-type-toggle";
import { PageHead } from "@/components/site/page-head";
import { StoreClosedBanner } from "@/components/site/store-closed-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/features/auth";
import { usePricedCart } from "@/features/cart";
import { useOpenState } from "@/features/settings";
import { usePick, useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { getProvisionalEstimate, placeOrder } from "@/services/orders";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";
import { SlotPicker } from "./_slot-picker";

type PaymentChoice = "ONLINE" | "CASH";

/** Checkout. Every rule it enforces is re-checked by placeOrder on submit. */
export function CheckoutForm() {
  const t = useT();
  const pick = usePick();
  const router = useRouter();
  const { user } = useSession();

  const lines = useCartStore((s) => s.lines);
  const orderType = useCartStore((s) => s.orderType);
  const couponCode = useCartStore((s) => s.couponCode);
  const isHydrated = useCartStore((s) => s.isHydrated);
  const clearCart = useCartStore((s) => s.clear);

  const { data: cart, isLoading } = usePricedCart(lines, couponCode, orderType);
  const { data: openState } = useOpenState();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentChoice>("ONLINE");
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);

  /*
    An empty cart means there is nothing to check out — but not right after a
    successful order, when clearing the cart is the expected outcome and the
    redirect to the confirmation is already under way.
  */
  useEffect(() => {
    if (!isHydrated || isPlaced || lines.length > 0) return;
    router.replace("/cart");
  }, [isHydrated, isPlaced, lines.length, router]);

  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.name);
    setPhone((current) => current || user.phone);
  }, [user]);

  // Provisional estimate only — the real promise comes when an admin accepts.
  useEffect(() => {
    if (lines.length === 0) return;
    void getProvisionalEstimate(lines).then(setEstimate);
  }, [lines]);

  // Takeaway is online-only, so a stale "cash" choice must not survive a switch.
  useEffect(() => {
    if (orderType === "TAKEAWAY") {
      setPayment("ONLINE");
      return;
    }
    setScheduledFor(null);
  }, [orderType]);

  const canOrder = !openState || (openState.isOpen && openState.acceptingOrders);
  const isCash = orderType === "DINE_IN" && payment === "CASH";

  const itemNames = useMemo(
    () => lines.map((line) => `${line.quantity} × ${pick(line.name)}`),
    [lines, pick],
  );

  /**
   * Cash orders are created immediately; online orders are created only after
   * the simulated gateway succeeds, so the draft is handed to /checkout/pay.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isPlacing) return;
    setError(null);

    if (!name.trim() || !phone.trim()) {
      setError(t.validation.nameRequired);
      return;
    }

    if (!isCash) {
      const draft = {
        orderType,
        paymentMethod: null,
        pickupName: name.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
        scheduledFor: scheduledFor ?? undefined,
        couponCode,
      };
      sessionStorage.setItem("qb:checkout-draft", JSON.stringify(draft));
      router.push("/checkout/pay");
      return;
    }

    setIsPlacing(true);
    try {
      const order = await placeOrder({
        lines,
        orderType: "DINE_IN",
        paymentMethod: "CASH",
        pickupName: name.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
        couponCode,
      });
      setIsPlaced(true);
      clearCart();
      router.replace(`/order/${order.id}`);
    } catch (caught) {
      // The cart is deliberately left intact so nothing is lost.
      setError(toErrorMessage(caught));
      setIsPlacing(false);
    }
  };

  return (
    <>
      <PageHead title={t.checkout.title}>
        <StoreClosedBanner className="mt-5" />
      </PageHead>

      <Container className="py-6 pb-16 sm:py-10">
        <form
          onSubmit={handleSubmit}
          className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start"
        >
        <div className="grid gap-6">
          <OrderTypeToggle />

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">
              {orderType === "TAKEAWAY"
                ? t.checkout.pickupDetails
                : t.checkout.tableDetails}
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField id="co-name" label={t.checkout.name}>
                <Input
                  {...fieldAria("co-name")}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                />
              </FormField>
              <FormField id="co-phone" label={t.checkout.phone}>
                <Input
                  {...fieldAria("co-phone")}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel-national"
                />
              </FormField>

              {orderType === "DINE_IN" && (
                <FormField
                  id="co-table"
                  label={t.checkout.tableNumber}
                  hint={t.checkout.tableNumberHint}
                  className="sm:col-span-2"
                >
                  <Input
                    {...fieldAria("co-table", undefined, t.checkout.tableNumberHint)}
                    value={tableNumber}
                    onChange={(event) => setTableNumber(event.target.value)}
                    inputMode="numeric"
                    maxLength={4}
                  />
                </FormField>
              )}

              <FormField
                id="co-notes"
                label={t.checkout.notes}
                className="sm:col-span-2"
              >
                <Textarea
                  {...fieldAria("co-notes")}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t.checkout.notesPlaceholder}
                  rows={2}
                  maxLength={160}
                />
              </FormField>
            </div>
          </Card>

          {orderType === "TAKEAWAY" && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">{t.checkout.when}</h2>
              <SlotPicker
                value={scheduledFor}
                onChange={setScheduledFor}
                asapHint={
                  estimate !== null ? t.checkout.asapHint(estimate) : t.common.loading
                }
                className="mt-4"
              />
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">{t.checkout.payment}</h2>

            {orderType === "TAKEAWAY" ? (
              <div className="mt-3 flex items-start gap-3 rounded-control border border-brand/30 bg-brand/5 p-3.5">
                <CreditCard
                  size={18}
                  className="mt-0.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {t.checkout.payOnline}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {t.checkout.prepaidNote}
                  </p>
                </div>
              </div>
            ) : (
              <fieldset className="mt-3 grid gap-2">
                <legend className="sr-only">{t.checkout.payment}</legend>
                {(
                  [
                    {
                      value: "ONLINE",
                      label: t.checkout.payOnline,
                      hint: "",
                      Icon: CreditCard,
                    },
                    {
                      value: "CASH",
                      label: t.checkout.payCash,
                      hint: t.checkout.cashNote,
                      Icon: Wallet,
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-control border p-3.5 transition-colors",
                      "focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2",
                      payment === option.value
                        ? "border-brand bg-brand/5"
                        : "border-hairline hover:border-ink/20",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.value}
                      checked={payment === option.value}
                      onChange={() => setPayment(option.value)}
                      className="sr-only"
                    />
                    <option.Icon
                      size={18}
                      className={cn(
                        "mt-0.5 shrink-0",
                        payment === option.value ? "text-brand" : "text-ink-muted",
                      )}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {option.label}
                      </span>
                      {option.hint && (
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {option.hint}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
          </Card>
        </div>

        <div className="lg:sticky lg:top-24">
          <Card className="p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold text-ink">{t.checkout.summary}</h2>
              <Link
                href="/cart"
                className="text-xs font-semibold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
              >
                {t.checkout.editCart}
              </Link>
            </div>

            <ul className="mt-3 grid gap-1 text-sm text-ink-muted">
              {itemNames.map((label) => (
                <li key={label} className="truncate">
                  {label}
                </li>
              ))}
            </ul>

            <CartSummary cart={cart} isLoading={isLoading} className="mt-5" />

            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-5 w-full"
              disabled={!canOrder || isPlacing || isLoading}
            >
              {isPlacing
                ? t.checkout.placing
                : isCash
                  ? t.checkout.placeOrder
                  : t.checkout.continueToPayment}
            </Button>
          </Card>
          </div>
        </form>
      </Container>
    </>
  );
}
