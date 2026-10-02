"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Loader2, Lock, QrCode, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { FormField, fieldAria } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePricedCart } from "@/features/cart";
import { useT } from "@/i18n";
import { toErrorMessage } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import { luhnValid, formatCardNumber, formatExpiry, expiryValid } from "@/lib/card";
import { getOrder, placeOrder, retryOnlinePayment } from "@/services/orders";
import { useCartStore } from "@/store/cart";
import type { OrderType, PaymentMethod } from "@/types";

const PROCESSING_MS = 1500;

interface CheckoutDraft {
  orderType: OrderType;
  pickupName: string;
  phone: string;
  notes?: string;
  tableNumber?: string;
  scheduledFor?: string;
  couponCode?: string;
}

/**
 * Simulated gateway.
 *
 * Serves two jobs: paying for a cart that has not become an order yet, and
 * re-paying an order that already exists (?orderId=) after a rejected payment
 * or a dine-in cash switch. No card details are kept — the inputs are local
 * state and nothing is written anywhere.
 */
export function PayForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();

  const lines = useCartStore((s) => s.lines);
  const orderType = useCartStore((s) => s.orderType);
  const couponCode = useCartStore((s) => s.couponCode);
  const clearCart = useCartStore((s) => s.clear);
  const { data: cart } = usePricedCart(lines, couponCode, orderType);

  const existingOrderId = params.get("orderId");
  const shouldFail = params.get("fail") === "1";

  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "failed">("idle");
  const isSubmitting = useRef(false);

  // Paying for an existing order, or for the cart we just came from.
  useEffect(() => {
    if (existingOrderId) {
      void getOrder(existingOrderId)
        .then((order) => setAmount(order.total))
        .catch(() => setAmount(null));
      return;
    }
    const raw = sessionStorage.getItem("qb:checkout-draft");
    if (raw) setDraft(JSON.parse(raw) as CheckoutDraft);
  }, [existingOrderId]);

  useEffect(() => {
    if (!existingOrderId && cart) setAmount(cart.total);
  }, [cart, existingOrderId]);

  const validate = (): boolean => {
    setFieldError(null);
    if (method === "upi") {
      if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        setFieldError(t.pay.invalidUpi);
        return false;
      }
      return true;
    }
    if (!luhnValid(card.number)) {
      setFieldError(t.pay.invalidCard);
      return false;
    }
    if (!expiryValid(card.expiry)) {
      setFieldError(t.pay.invalidExpiry);
      return false;
    }
    if (!/^\d{3,4}$/.test(card.cvv)) {
      setFieldError(t.pay.invalidCvv);
      return false;
    }
    return true;
  };

  const handlePay = async () => {
    if (isSubmitting.current) return;
    if (!validate()) return;

    isSubmitting.current = true;
    setStatus("processing");
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_MS));

    if (shouldFail) {
      setStatus("failed");
      isSubmitting.current = false;
      return;
    }

    const paymentMethod: PaymentMethod =
      method === "upi" ? "ONLINE_UPI" : "ONLINE_CARD";

    try {
      if (existingOrderId) {
        await retryOnlinePayment(existingOrderId, paymentMethod);
        router.replace(`/order/${existingOrderId}`);
        return;
      }
      if (!draft) {
        setStatus("failed");
        isSubmitting.current = false;
        return;
      }

      const order = await placeOrder({
        lines,
        orderType: draft.orderType,
        paymentMethod,
        pickupName: draft.pickupName,
        phone: draft.phone,
        notes: draft.notes,
        tableNumber: draft.tableNumber,
        scheduledFor: draft.scheduledFor,
        couponCode: draft.couponCode,
      });

      sessionStorage.removeItem("qb:checkout-draft");
      clearCart();
      router.replace(`/order/${order.id}`);
    } catch (caught) {
      // Placement failed after "payment" — the cart is untouched, so send
      // them back to checkout with the real reason rather than a dead end.
      setFieldError(toErrorMessage(caught));
      setStatus("idle");
      isSubmitting.current = false;
    }
  };

  if (status === "failed") {
    return (
      <Container className="py-12">
        <Card className="mx-auto max-w-md p-6 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <TriangleAlert size={24} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h1 className="text-display mt-4 text-2xl text-ink uppercase">
            {t.pay.failedTitle}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{t.pay.failedBody}</p>
          <div className="mt-6 grid gap-2">
            <Button
              onClick={() => {
                setStatus("idle");
                // Drop ?fail=1 so the retry can succeed.
                router.replace(
                  existingOrderId
                    ? `/checkout/pay?orderId=${existingOrderId}`
                    : "/checkout/pay",
                );
              }}
            >
              {t.pay.retry}
            </Button>
            <Button asChild variant="outline">
              <Link href="/checkout">{t.pay.backToCheckout}</Link>
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-md">
        <p className="inline-flex items-center gap-1.5 rounded-pill bg-sand-100 px-3 py-1 text-xs font-semibold text-ink-muted">
          <Lock size={12} aria-hidden="true" />
          {t.pay.prototype}
        </p>

        <h1 className="text-display mt-4 text-3xl text-ink uppercase">{t.pay.title}</h1>
        {amount !== null && (
          <p className="nums mt-1 text-lg font-semibold text-ink">
            {formatPrice(amount)}
          </p>
        )}

        <Card className="mt-6 p-5">
          <Tabs
            value={method}
            onValueChange={(value) => setMethod(value as "upi" | "card")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="upi" className="flex-1">
                <QrCode size={16} aria-hidden="true" />
                {t.pay.upi}
              </TabsTrigger>
              <TabsTrigger value="card" className="flex-1">
                <CreditCard size={16} aria-hidden="true" />
                {t.pay.card}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upi" className="pt-5">
              <div
                aria-hidden="true"
                className="mx-auto grid size-40 place-items-center rounded-card border border-hairline bg-[repeating-conic-gradient(var(--color-ink)_0_25%,transparent_0_50%)] bg-[length:16px_16px] opacity-80"
              />
              <p className="mt-3 text-center text-xs text-ink-muted">
                {t.pay.scanHint}
              </p>
              <FormField id="upi-id" label={t.pay.upiId} className="mt-4">
                <Input
                  {...fieldAria("upi-id")}
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder={t.pay.upiIdPlaceholder}
                  autoComplete="off"
                />
              </FormField>
            </TabsContent>

            <TabsContent value="card" className="grid gap-4 pt-5">
              <FormField id="card-number" label={t.pay.cardNumber}>
                <Input
                  {...fieldAria("card-number")}
                  value={card.number}
                  onChange={(event) =>
                    setCard({ ...card, number: formatCardNumber(event.target.value) })
                  }
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="4111 1111 1111 1111"
                />
              </FormField>
              <FormField id="card-name" label={t.pay.cardName}>
                <Input
                  {...fieldAria("card-name")}
                  value={card.name}
                  onChange={(event) => setCard({ ...card, name: event.target.value })}
                  autoComplete="off"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField id="card-expiry" label={t.pay.expiry}>
                  <Input
                    {...fieldAria("card-expiry")}
                    value={card.expiry}
                    onChange={(event) =>
                      setCard({ ...card, expiry: formatExpiry(event.target.value) })
                    }
                    inputMode="numeric"
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </FormField>
                <FormField id="card-cvv" label={t.pay.cvv}>
                  <Input
                    {...fieldAria("card-cvv")}
                    value={card.cvv}
                    onChange={(event) =>
                      setCard({
                        ...card,
                        cvv: event.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    inputMode="numeric"
                    maxLength={4}
                    autoComplete="off"
                  />
                </FormField>
              </div>
            </TabsContent>
          </Tabs>

          {fieldError && (
            <p role="alert" className="mt-4 text-sm font-medium text-danger">
              {fieldError}
            </p>
          )}

          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={status === "processing" || amount === null}
            onClick={() => void handlePay()}
          >
            {status === "processing" ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t.pay.processing}
              </>
            ) : (
              t.pay.payNow(formatPrice(amount ?? 0))
            )}
          </Button>
        </Card>
      </div>
    </Container>
  );
}
