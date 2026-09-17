import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OrderDetailView } from "@/components/orders/order-detail-view";
import { SupplierShell } from "@/components/supplier/supplier-shell";
import { requireApprovedSupplier } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/data";

export const metadata: Metadata = { title: "Supplier order detail" };

type SupplierOrderPageProps = { params: Promise<{ id: string }> };

export default async function SupplierOrderPage({
  params,
}: SupplierOrderPageProps) {
  const user = await requireApprovedSupplier();
  const order = await getOrderForUser(user, (await params).id);

  if (!order) notFound();

  return (
    <SupplierShell activeHref="/supplier/orders" user={user}>
      <OrderDetailView
        order={order}
        role="SUPPLIER"
        backHref="/supplier/orders"
      />
    </SupplierShell>
  );
}
