import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersList } from "@/components/orders/orders-list";
import { requireRole } from "@/lib/auth/session";
import { getOrdersForUser } from "@/lib/orders/data";

export const metadata: Metadata = {
  title: "Order administration",
  description: "Monitor and manage every StockFlow supplier order.",
};

export default async function AdminOrdersPage() {
  const user = await requireRole("ADMIN");
  const orders = await getOrdersForUser(user);

  return (
    <AdminShell activeHref="/admin/orders" user={user}>
      <OrdersList orders={orders} role="ADMIN" detailBasePath="/admin/orders" />
    </AdminShell>
  );
}
