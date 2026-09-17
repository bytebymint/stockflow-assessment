"use client";

import { RefreshCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OrdersErrorState({ reset }: { reset: () => void }) {
  return (
    <div
      className="border-destructive/25 bg-destructive/5 rounded-2xl border p-6 sm:p-8"
      role="alert"
    >
      <div className="flex items-start gap-4">
        <span className="bg-destructive/10 text-destructive flex size-11 shrink-0 items-center justify-center rounded-xl">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold">Orders could not be loaded</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-6">
            The order service is temporarily unavailable. No order was changed;
            retry when the database connection is ready.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={reset}
          >
            <RefreshCcw data-icon="inline-start" aria-hidden="true" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
