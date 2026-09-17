import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { requireRole } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/data";

export const metadata: Metadata = { title: "Admin order detail" };

type AdminOrderPageProps = { params: Promise<{ id: string }> };

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const user = await requireRole("ADMIN");
  const order = await getOrderForUser(user, (await params).id);

  if (!order) notFound();

  return (
    <AdminShell activeHref="/admin/orders" user={user}>
      <OrderDetailView order={order} role="ADMIN" backHref="/admin/orders" />
    </AdminShell>
  );
}
