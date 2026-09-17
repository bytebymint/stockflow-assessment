"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import type {
  CheckoutErrorResponse,
  CheckoutSuccessResponse,
} from "@/lib/checkout-contract";

export function CheckoutButton() {
  const router = useRouter();
  const { items, reconciliationStatus, clearCart, refreshCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutToken = useRef<string | null>(null);
  const hasBlockingIssue = items.some(
    (item) =>
      !item.live?.orderable ||
      item.live.issues.some((issue) => issue.code === "PRICE_CHANGED"),
  );
  const checkoutReady =
    items.length > 0 && reconciliationStatus === "ready" && !hasBlockingIssue;

  async function handleCheckout() {
    if (!checkoutReady || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);
    checkoutToken.current ??= crypto.randomUUID();

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkoutToken: checkoutToken.current,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.snapshot.unitPrice,
          })),
        }),
      });
      const result = (await response.json()) as
        CheckoutSuccessResponse | CheckoutErrorResponse;

      if (!response.ok || !("checkout" in result)) {
        const message =
          "message" in result
            ? result.message
            : "Checkout could not be completed.";
        setErrorMessage(message);

        if (response.status === 409) {
          checkoutToken.current = null;
          refreshCart();
        }

        return;
      }

      clearCart({ announce: false });
      toast.success(
        `${result.checkout.orderCount} ${result.checkout.orderCount === 1 ? "order" : "orders"} created successfully.`,
      );
      router.push(
        `/checkout/success?reference=${encodeURIComponent(result.checkout.reference)}`,
      );
    } catch {
      setErrorMessage(
        "The server could not be reached. Your cart is unchanged, so it is safe to retry.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5">
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!checkoutReady || submitting}
        onClick={handleCheckout}
        aria-describedby={errorMessage ? "checkout-error" : "checkout-help"}
      >
        {submitting ? (
          <LoaderCircle
            className="animate-spin motion-reduce:animate-none"
            data-icon="inline-start"
            aria-hidden="true"
          />
        ) : (
          <LockKeyhole data-icon="inline-start" aria-hidden="true" />
        )}
        {submitting ? "Creating orders…" : "Create orders"}
      </Button>

      <p
        id="checkout-help"
        className="text-muted-foreground mt-2 text-center text-xs leading-5"
      >
        Stock is reserved only when every supplier order succeeds.
      </p>

      {errorMessage ? (
        <div
          id="checkout-error"
          className="border-destructive/25 bg-destructive/5 mt-4 rounded-lg border p-3"
          role="alert"
        >
          <p className="text-destructive text-sm font-semibold">
            Checkout was not completed
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            {errorMessage}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setErrorMessage(null);
              refreshCart();
            }}
          >
            <RefreshCcw data-icon="inline-start" aria-hidden="true" />
            Recheck cart
          </Button>
        </div>
      ) : null}
    </div>
  );
}
