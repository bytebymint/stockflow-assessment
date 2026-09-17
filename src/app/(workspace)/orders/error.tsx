"use client";

import { OrdersErrorState } from "@/components/orders/orders-error-state";

export default function CustomerOrdersError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <OrdersErrorState reset={reset} />
    </main>
  );
}
