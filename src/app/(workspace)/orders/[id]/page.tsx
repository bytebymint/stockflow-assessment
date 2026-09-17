import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerShell } from "@/components/customer/customer-shell";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { requireRole } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/data";

export const metadata: Metadata = { title: "Order detail" };

type CustomerOrderPageProps = { params: Promise<{ id: string }> };

export default async function CustomerOrderPage({
  params,
}: CustomerOrderPageProps) {
  const user = await requireRole("CUSTOMER");
  const order = await getOrderForUser(user, (await params).id);

  if (!order) notFound();

  return (
    <CustomerShell activeHref="/orders" user={user}>
      <OrderDetailView order={order} role="CUSTOMER" backHref="/orders" />
    </CustomerShell>
  );
}
