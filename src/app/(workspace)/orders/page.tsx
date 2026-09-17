import type { Metadata } from "next";

import { CustomerShell } from "@/components/customer/customer-shell";
import { OrdersList } from "@/components/orders/orders-list";
import { requireRole } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/orders/data";

export const metadata: Metadata = {
  title: "Your orders",
  description: "Track every supplier order created through StockFlow.",
};

export default async function CustomerOrdersPage() {
  const user = await requireRole("CUSTOMER");
  const orders = await getOrdersForUser(user);

  return (
    <CustomerShell activeHref="/orders" user={user}>
      <OrdersList orders={orders} role="CUSTOMER" detailBasePath="/orders" />
    </CustomerShell>
  );
}
