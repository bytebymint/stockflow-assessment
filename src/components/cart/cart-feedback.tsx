"use client";

import { LoaderCircle, RefreshCcw, TriangleAlert } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function CartFeedback() {
  const { reconciliationStatus, reconciliationError, refreshCart } = useCart();

  if (reconciliationStatus === "checking") {
    return (
      <div
        className="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
        role="status"
      >
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Checking current prices and stock…
      </div>
    );
  }

  if (reconciliationStatus === "error") {
    return (
      <div
        className="border-destructive/25 bg-destructive/5 rounded-lg border p-3"
        role="alert"
      >
        <div className="flex items-start gap-2">
          <TriangleAlert
            className="text-destructive mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Cart refresh failed</p>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              {reconciliationError ?? "Check your connection and retry."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={refreshCart}
            >
              <RefreshCcw data-icon="inline-start" aria-hidden="true" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
