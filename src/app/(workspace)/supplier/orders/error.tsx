"use client";

import { OrdersErrorState } from "@/components/orders/orders-error-state";

export default function SupplierOrdersError({ reset }: { reset: () => void }) {
  return <OrdersErrorState reset={reset} />;
}
